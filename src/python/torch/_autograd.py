"""
Automatic differentiation: whether gradients are being tracked, the graph that tracking builds, and
the backward pass that walks it.

Every operation on a tensor that needs gradients makes a Node, which remembers how to turn the
gradient of the operation's result into the gradients of its inputs, and which nodes made those
inputs. `backward()` starts at the node of the result and walks back through all of them, newest
first, adding the gradients it finds to the `.grad` of the leaf tensors.
"""

import functools
import heapq
import inspect
import itertools

import numpy as np

# Set by _tensor.py, which defines the class.
Tensor = None

_grad_enabled = True
_sequence = itertools.count()


# ---------- Whether gradients are tracked ----------


def is_grad_enabled():
    return _grad_enabled


def _set(mode):
    global _grad_enabled
    _grad_enabled = bool(mode)


class _ContextAndDecorator:
    """Something that works as `with torch.no_grad():` and as `@torch.no_grad()` above a function."""

    def __new__(cls, orig_func=None):
        # `@torch.no_grad` without the brackets works too.
        if orig_func is None:
            return super().__new__(cls)
        return cls()(orig_func)

    def __call__(self, function):
        if inspect.isgeneratorfunction(function):

            @functools.wraps(function)
            def generator(*args, **kwargs):
                with self.__class__():
                    yield from function(*args, **kwargs)

            return generator

        @functools.wraps(function)
        def wrapper(*args, **kwargs):
            with self.__class__():
                return function(*args, **kwargs)

        return wrapper


class no_grad(_ContextAndDecorator):
    """Stops tracking gradients inside the block."""

    def __enter__(self):
        self.previous = _grad_enabled
        _set(False)

    def __exit__(self, *exc):
        _set(self.previous)


class enable_grad(_ContextAndDecorator):
    """Tracks gradients inside the block, even inside a no_grad one."""

    def __enter__(self):
        self.previous = _grad_enabled
        _set(True)

    def __exit__(self, *exc):
        _set(self.previous)


class set_grad_enabled:
    """Turns gradient tracking on or off: right away when called, and again as it was after a `with` block."""

    def __init__(self, mode):
        self.previous = _grad_enabled
        _set(mode)

    def __enter__(self):
        pass

    def __exit__(self, *exc):
        _set(self.previous)

    def __call__(self, function):
        @functools.wraps(function)
        def wrapper(*args, **kwargs):
            with self.__class__(self.previous):
                return function(*args, **kwargs)

        return wrapper


class inference_mode(_ContextAndDecorator):
    """Like no_grad: the page doesn't track what inference mode would leave out."""

    def __init__(self, mode=True):
        self.mode = mode

    def __enter__(self):
        self.previous = _grad_enabled
        if self.mode:
            _set(False)

    def __exit__(self, *exc):
        _set(self.previous)


def is_inference_mode_enabled():
    return False


# ---------- The graph ----------

_NODE_KINDS = {}


class Node:
    """
    One step of the graph: the operation that made a tensor. `edges` are the nodes that made its
    inputs (None for an input that needs no gradient) and `fn` turns the gradient of the result
    into the gradients of the inputs.
    """

    __slots__ = ('edges', 'fn', 'saves', 'seq', 'released', 'checks', 'retain', 'outputs')

    def __init__(self, edges, fn, saves=True, checks=()):
        self.edges = edges
        self.fn = fn
        # Whether the node keeps numbers it needs to go backward, which backward() frees afterwards.
        self.saves = saves
        self.seq = next(_sequence)
        self.released = False
        # Tensors the node needs, with how many times each had been changed in place when it saved them.
        self.checks = tuple((t, t._vc[0], False) for t in checks)
        self.retain = None
        # Which of the saved tensors this node made itself, like the result of exp().
        self.outputs = None

    _full = None

    def name(self):
        return self._full or type(self).__name__

    @property
    def next_functions(self):
        return tuple((edge, 0) for edge in self.edges)

    def apply(self, grad):
        if self.released:
            raise RuntimeError(
                'Trying to backward through the graph a second time (or directly access saved tensors after they have '
                'already been freed). Saved intermediate values of the graph are freed when you call .backward() or '
                'autograd.grad(). Specify retain_graph=True if you need to backward through the graph a second time '
                'or if you need to access saved tensors after calling backward.'
            )
        for tensor, version, *_ in self.checks:
            if tensor._vc[0] != version:
                raise RuntimeError(_modified_in_place(tensor, version, self if self.outputs and id(tensor) in self.outputs else None))
        return self.fn(grad)

    def __repr__(self):
        return f'<{self.name()} object at {hex(id(self))}>'


class AccumulateGrad(Node):
    """The end of a path through the graph: a leaf tensor, which collects its gradient in `.grad`."""

    __slots__ = ('variable',)

    def __init__(self, variable):
        super().__init__((), None, saves=False)
        self.variable = variable

    def name(self):
        return 'torch::autograd::AccumulateGrad'

    def accumulate(self, grad):
        variable = self.variable
        grad = np.asarray(grad, dtype=variable._dtype.numpy)
        if variable._grad is None:
            variable._grad = Tensor._wrap(grad.copy(), variable._dtype)
        else:
            variable._grad._data += grad

    def __repr__(self):
        return f'<torch::autograd::AccumulateGrad object at {hex(id(self))}>'


def node_kind(name, full=None):
    """The class of the nodes an operation makes: its name is what a tensor's `grad_fn=<…>` shows."""
    kind = _NODE_KINDS.get(name)
    if kind is None:
        kind = _NODE_KINDS[name] = type(name, (Node,), {'__slots__': (), '_full': full or name})
    return kind


def edge_of(tensor):
    """The node that gradients for a tensor go to: the one that made it, or the one that collects a leaf's."""
    if tensor._grad_fn is not None:
        return tensor._grad_fn
    if tensor._requires_grad:
        if tensor._acc is None:
            tensor._acc = AccumulateGrad(tensor)
        return tensor._acc
    return None


def track(name, inputs, fn, saves=True, saved=()):
    """
    The node for an operation on `inputs` (tensors), or None when nothing needs one: gradients
    aren't being tracked, or no input needs them. `saved` are the tensors whose numbers `fn` uses.
    """
    if not _grad_enabled:
        return None
    for tensor in inputs:
        if tensor._requires_grad:
            break
    else:
        return None
    return node_kind(name)(tuple(edge_of(t) for t in inputs), fn, saves, saved)


def made_by(node, result):
    """Says that the node saves `result`, which it made itself, like exp() does."""
    node.outputs = {id(result)}


_KIND_NAMES = {
    'float32': 'FloatTensor',
    'float64': 'DoubleTensor',
    'float16': 'HalfTensor',
    'int64': 'LongTensor',
    'int32': 'IntTensor',
    'int16': 'ShortTensor',
    'int8': 'CharTensor',
    'uint8': 'ByteTensor',
    'bool': 'BoolTensor',
}


def _strip(name):
    return name.rsplit('Backward', 1)[0] if name.endswith(tuple('Backward' + str(i) for i in range(10))) else name


def _modified_in_place(tensor, version, producer=None):
    shape = ', '.join(str(n) for n in tensor._data.shape)
    maker = producer or tensor._grad_fn
    where = f', which is output 0 of {_strip(maker.name())},' if maker is not None else ','
    return (
        'one of the variables needed for gradient computation has been modified by an inplace operation: '
        f'[torch.{_KIND_NAMES[tensor._dtype.name]} [{shape}]]{where} is at version {tensor._vc[0]}; '
        f'expected version {version} instead. Hint: enable anomaly detection to find the operation that failed to '
        'compute its gradient, with torch.autograd.set_detect_anomaly(True, check_nan=False).'
    )


# ---------- The backward pass ----------


def run_backward(roots, root_grads, retain_graph, inputs=None, accumulate=True):
    """
    Goes back through the graph from `roots` (tensors) with `root_grads` (arrays), newest operation
    first, and a node only once all the nodes after it have passed their gradients to it. Leaf
    tensors collect them in `.grad`, unless `accumulate` is False. Returns the gradients that
    reached `inputs` (tensors), as arrays or None, for torch.autograd.grad.
    """
    start = []
    for root, grad in zip(roots, root_grads):
        node = edge_of(root)
        if node is None:
            raise RuntimeError('element 0 of tensors does not require grad and does not have a grad_fn')
        start.append((node, grad))

    # How many nodes will pass a gradient to each node, found by walking the graph once.
    needs = {}
    seen = set()
    stack = [node for node, _ in start]
    while stack:
        node = stack.pop()
        if id(node) in seen:
            continue
        seen.add(id(node))
        for edge in node.edges:
            if edge is not None:
                needs[edge] = needs.get(edge, 0) + 1
                stack.append(edge)

    wanted = {}
    if inputs is not None:
        for index, tensor in enumerate(inputs):
            node = edge_of(tensor)
            if node is None:
                raise RuntimeError('One of the differentiated Tensors does not require grad')
            wanted.setdefault(node, []).append(index)
        results = [None] * len(inputs)

    arriving = {}
    ready = []
    for node, grad in start:
        arriving[node] = grad if node not in arriving else arriving[node] + grad
    for node in arriving:
        if needs.get(node, 0) == 0:
            heapq.heappush(ready, (-node.seq, id(node), node))
    queued = {node for node in arriving if needs.get(node, 0) == 0}

    while ready:
        _, _, node = heapq.heappop(ready)
        grad = arriving.pop(node, None)
        if grad is not None:
            if node.retain:
                for tensor in node.retain:
                    if tensor._grad is None:
                        tensor._grad = Tensor._wrap(np.array(grad, copy=True), tensor._dtype)
                    else:
                        tensor._grad._data += grad
            if node in wanted:
                for index in wanted[node]:
                    results[index] = grad
        if isinstance(node, AccumulateGrad):
            if grad is not None and accumulate:
                node.accumulate(grad)
            continue
        if grad is None:
            produced = (None,) * len(node.edges)
        else:
            produced = node.apply(grad)
            if node.saves and not retain_graph:
                node.released = True
        for edge, passed in zip(node.edges, produced):
            if edge is None:
                continue
            if passed is not None:
                arriving[edge] = passed if edge not in arriving else arriving[edge] + passed
            needs[edge] -= 1
            if needs[edge] == 0 and edge not in queued:
                queued.add(edge)
                heapq.heappush(ready, (-edge.seq, id(edge), edge))
    return results if inputs is not None else None


def backward_from(tensor, gradient=None, retain_graph=None, create_graph=False, inputs=None):
    """Tensor.backward(): fills in the .grad of the tensors that the tensor was worked out from."""
    if create_graph:
        raise NotImplementedError('create_graph=True is not available in the page')
    if not tensor._requires_grad:
        raise RuntimeError('element 0 of tensors does not require grad and does not have a grad_fn')
    if gradient is None:
        if tensor._data.size != 1:
            raise RuntimeError('grad can be implicitly created only for scalar outputs')
        grad = np.ones_like(tensor._data)
    else:
        grad = np.asarray(gradient._data if isinstance(gradient, Tensor) else gradient, dtype=tensor._dtype.numpy)
        if grad.shape != tensor._data.shape:
            raise RuntimeError(
                f'Mismatch in shape: grad_output[0] has a shape of {Tensor._size_of(grad)} and output[0] has a '
                f'shape of {Tensor._size_of(tensor._data)}.'
            )
    if retain_graph is None:
        retain_graph = create_graph
    if inputs is not None:
        # Only these tensors collect gradients.
        wanted = [inputs] if isinstance(inputs, Tensor) else list(inputs)
        captured = run_backward([tensor], [grad], retain_graph, inputs=wanted, accumulate=False)
        for target, found in zip(wanted, captured):
            if found is not None:
                if target._grad is None:
                    target._grad = Tensor._wrap(np.array(found, copy=True), target._dtype)
                else:
                    target._grad._data += found
        return
    run_backward([tensor], [grad], retain_graph)


def grad(outputs, inputs, grad_outputs=None, retain_graph=None, create_graph=False, allow_unused=None, is_grads_batched=False, materialize_grads=False):
    """torch.autograd.grad: the gradients of outputs with respect to inputs, returned instead of added to .grad."""
    if create_graph:
        raise NotImplementedError('create_graph=True is not available in the page')
    outputs = [outputs] if isinstance(outputs, Tensor) else list(outputs)
    single = isinstance(inputs, Tensor)
    inputs = [inputs] if single else list(inputs)
    if grad_outputs is None:
        grad_outputs = [None] * len(outputs)
    elif isinstance(grad_outputs, Tensor):
        grad_outputs = [grad_outputs]
    grads = []
    for output, given in zip(outputs, grad_outputs):
        if not output._requires_grad:
            raise RuntimeError('element 0 of tensors does not require grad and does not have a grad_fn')
        if given is None:
            if output._data.size != 1:
                raise RuntimeError('grad can be implicitly created only for scalar outputs')
            grads.append(np.ones_like(output._data))
        else:
            grads.append(np.asarray(given._data, dtype=output._dtype.numpy))
    if retain_graph is None:
        retain_graph = create_graph
    found = run_backward(outputs, grads, retain_graph, inputs=inputs, accumulate=False)
    result = []
    for tensor, value in zip(inputs, found):
        if value is None:
            if not allow_unused and not materialize_grads:
                raise RuntimeError(
                    f'The differentiated Tensor at index {inputs.index(tensor)} appears to not have been used in the graph. '
                    'Set allow_unused=True if this is the desired behavior.'
                )
            result.append(Tensor._wrap(np.zeros_like(tensor._data), tensor._dtype) if materialize_grads else None)
        else:
            result.append(Tensor._wrap(np.array(value, copy=True), tensor._dtype))
    return tuple(result)


def backward(tensors, grad_tensors=None, retain_graph=None, create_graph=False, inputs=None):
    """torch.autograd.backward: Tensor.backward() for several tensors at once."""
    if create_graph:
        raise NotImplementedError('create_graph=True is not available in the page')
    tensors = [tensors] if isinstance(tensors, Tensor) else list(tensors)
    if grad_tensors is None:
        given = [None] * len(tensors)
    elif isinstance(grad_tensors, Tensor):
        given = [grad_tensors]
    else:
        given = list(grad_tensors)
    grads = []
    for tensor, one in zip(tensors, given):
        if not tensor._requires_grad:
            raise RuntimeError('element 0 of tensors does not require grad and does not have a grad_fn')
        if one is None:
            if tensor._data.size != 1:
                raise RuntimeError('grad can be implicitly created only for scalar outputs')
            grads.append(np.ones_like(tensor._data))
        else:
            grads.append(np.asarray(one._data, dtype=tensor._dtype.numpy))
    if retain_graph is None:
        retain_graph = create_graph
    run_backward(tensors, grads, retain_graph)
