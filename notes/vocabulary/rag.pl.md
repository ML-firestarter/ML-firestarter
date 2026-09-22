---
description: Generowanie wspomagane wyszukiwaniem (ang. retrieval-augmented generation). Znalezienie dokumentów pasujących do pytania i przekazanie ich modelowi razem z nim, żeby odpowiedział na ich podstawie.
---

# RAG

Model wie tylko to, co było w jego danych treningowych, a te kończą się na jakiejś dacie i nie obejmują twoich prywatnych dokumentów. Generowanie wspomagane wyszukiwaniem rozwiązuje ten problem w chwili zadania pytania: najpierw wyszukuje się fragmenty najlepiej do niego pasujące, potem wkłada się je do promptu, a model odpowiada na ich podstawie. Nazwa pochodzi z artykułu Lewisa i in. z 2020 roku.

Typowy układ ma trzy kroki:

1. **Indeksowanie**: podziel dokumenty na fragmenty po kilkaset słów, oblicz [embedding](embedding.pl.md) każdego fragmentu i zapisz je w wektorowej bazie danych. To robi się zawczasu.
2. **Wyszukiwanie**: oblicz embedding pytania i znajdź fragmenty o najbliższych embeddingach, często w połączeniu ze zwykłym wyszukiwaniem po słowach kluczowych.
3. **Generowanie**: włóż najlepsze fragmenty do promptu razem z pytaniem i poproś model, żeby odpowiadał tylko na ich podstawie i je cytował.

Odpowiedzi pozostają aktualne bez ponownego trenowania: wystarczy zaktualizować dokumenty. Oparcie modelu na prawdziwym tekście ogranicza [halucynacje](hallucination.pl.md), a cytaty pozwalają czytelnikom sprawdzić odpowiedzi. RAG jest jednak tylko tak dobry jak jego wyszukiwanie: jeśli właściwy fragment nie zostanie znaleziony, model nie może go użyć. Podział dokumentów na fragmenty sprawia też, że to, co zostało znalezione, mieści się w [oknie kontekstowym](context-window.pl.md).

RAG to typowy sposób na przekazanie modelowi nowej wiedzy. [Dostrajanie](fine-tuning.pl.md) lepiej się sprawdza, gdy trzeba zmienić to, jak model się zachowuje, na przykład jego ton albo format odpowiedzi.

**Przykład:** asystent działu kadr dostaje pytanie „Ile dni urlopu mają nowi pracownicy?”. Wyszukuje w regulaminie fragment „Pracownicy zatrudnieni na pełen etat mają 20 dni płatnego urlopu rocznie, już od pierwszego roku pracy” i odpowiada „20 dni w roku”, z linkiem do tej strony regulaminu.

**Powiązane:** [Embedding](embedding.pl.md) · [Halucynacja](hallucination.pl.md) · [Okno kontekstowe](context-window.pl.md) · [Dostrajanie](fine-tuning.pl.md)
