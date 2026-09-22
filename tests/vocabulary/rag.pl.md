# RAG

## Jaki problem rozwiązuje RAG?

- [ ] Modele za wolno odpowiadają na długie pytania
- [x] Model wie tylko to, co było w jego danych treningowych, a te kończą się na jakiejś dacie i nie obejmują twoich prywatnych dokumentów
- [ ] Modele nie potrafią wykonywać poleceń
- [ ] Modele zapominają to, czego nauczyły się w pretreningu

RAG w chwili zadania pytania znajduje pasujące do niego fragmenty i wkłada je do promptu, a model odpowiada na ich podstawie.

## Który krok RAG wykonuje się zawczasu?

- [ ] Wyszukiwanie fragmentów najbliższych pytaniu
- [ ] Obliczenie embeddingu pytania
- [x] Indeksowanie: podział dokumentów na fragmenty, obliczenie ich embeddingów i zapisanie wektorów
- [ ] Generowanie odpowiedzi

Wyszukiwanie i generowanie odbywają się, gdy przychodzi pytanie. Indeks buduje się wcześniej.

## Dlaczego dokumenty dzieli się na fragmenty po kilkaset słów?

- [ ] Żeby można było na nich dostroić model
- [ ] Żeby każdy fragment był jednym tokenem
- [ ] Żeby dokumentów nie dało się później zmienić
- [x] Żeby to, co zostanie znalezione, zmieściło się w oknie kontekstowym

Najlepsze fragmenty trafiają do promptu razem z pytaniem, a wszystko to musi się zmieścić w oknie.

## Firma aktualizuje regulamin. Co musi zrobić, żeby jej asystent oparty na RAG odpowiadał na podstawie nowej wersji?

- [x] Zaktualizować dokumenty w indeksie; ponowne trenowanie nie jest potrzebne
- [ ] Dostroić model na nowym regulaminie
- [ ] Przeprowadzić pretrening nowego modelu
- [ ] Poczekać na następną wersję modelu

Odpowiedzi pozostają aktualne bez ponownego trenowania: wystarczy zaktualizować dokumenty.

## Jaka jest główna słabość RAG?

- [ ] Sprawia, że halucynacje są częstsze
- [ ] Nie potrafi cytować źródeł
- [x] Jest tylko tak dobry jak jego wyszukiwanie: jeśli właściwy fragment nie zostanie znaleziony, model nie może go użyć
- [ ] Model trzeba trenować od nowa dla każdego pytania

Oparcie odpowiedzi na prawdziwym tekście ogranicza halucynacje, a cytaty pozwalają czytelnikom je sprawdzić. Wszystko zależy jednak od znalezienia właściwego fragmentu.
