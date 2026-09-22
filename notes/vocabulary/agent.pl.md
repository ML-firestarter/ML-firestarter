---
description: System, w którym model językowy krok po kroku dąży do celu, sam wybierając narzędzia, takie jak wyszukiwarka, kod czy API, i korzystając z nich.
---

# Agent

Chatbot odpowiada na jedną wiadomość naraz. Agent dostaje cel i dąży do niego w pętli: model wybiera działanie, na przykład przeszukanie internetu, uruchomienie kodu albo wywołanie API, program je wykonuje, a wynik wraca do modelu, który decyduje, co dalej. Pętla kończy się, gdy model uzna, że cel został osiągnięty, albo gdy dojdzie do limitu kroków lub kosztów.

Model wybiera narzędzie, pisząc ustrukturyzowane żądanie, tak zwane *wywołanie narzędzia* (ang. tool call), z nazwą narzędzia i argumentami; sam niczego nie uruchamia. To, co agent może zrobić, zależy od narzędzi, które dostanie, więc podłączenie go do poczty, plików czy płatności zwiększa jego użyteczność, ale też stawkę każdego błędu. Błędy się przy tym kumulują: zły wynik na początku może wykoleić wszystkie kolejne kroki, dlatego agenci zwykle mają limity i pytają o zgodę przed ryzykownymi działaniami. Każdy krok wydłuża też rozmowę, którą widzi model, więc przy długich zadaniach może się zapełnić jego [okno kontekstowe](context-window.pl.md).

W [uczeniu przez wzmacnianie](rl.pl.md) „agent” oznacza każdy uczący się system, który działa w jakimś środowisku. Oba znaczenia się spotykają, bo agentów opartych na modelach językowych często trenuje się za pomocą RL na zadaniach wymagających wielu kroków.

**Przykład:** na pytanie „Który z naszych trzech największych klientów ma otwarte zgłoszenie do działu wsparcia?” agent odpytuje bazę sprzedaży o trzech największych klientów, szuka każdej nazwy w systemie zgłoszeń, a potem odpowiada na podstawie tego, co zwróciły narzędzia.

**Powiązane:** [RL](rl.pl.md) · [Polityka](policy.pl.md) · [RAG](rag.pl.md) · [Okno kontekstowe](context-window.pl.md)
