# Dostrajanie

## Czym jest dostrajanie?

- [ ] Trenowaniem modelu od zera na małym, ukierunkowanym zbiorze danych
- [x] Dalszym trenowaniem już wytrenowanego modelu na mniejszym, ukierunkowanym zbiorze danych
- [ ] Umieszczeniem kilku przykładów w prompcie
- [ ] Przepisaniem instrukcji modelu bez żadnego treningu

Dostrajanie wykorzystuje to, co wytrenowany model już wie, i koryguje go odrobiną dodatkowego treningu, zwykle z mniejszym współczynnikiem uczenia.

## Co z tego jest dostrajaniem?

- [x] SFT
- [ ] Pretrening
- [x] RLHF
- [x] DPO
- [ ] RAG

SFT dostraja model na przykładach dobrych odpowiedzi, a RLHF i DPO na podstawie preferencji. Pretrening to etap przed dostrajaniem, a RAG w ogóle nie trenuje modelu.

## Firma chce, żeby jej asystent odpowiadał na podstawie wewnętrznych dokumentów, które zmieniają się co tydzień. Co zwykle jest lepszym wyborem?

- [ ] Pełne dostrajanie na tych dokumentach co tydzień
- [x] RAG
- [ ] Dostrajanie LoRA na tych dokumentach
- [ ] Większy model bazowy

Dostrajanie najlepiej sprawdza się wtedy, gdy trzeba zmienić to, jak model się zachowuje. Żeby dać mu nową wiedzę, zwykle prościej użyć RAG, który łatwiej też aktualizować.

## Czym pełne dostrajanie różni się od LoRA?

- [x] Pełne dostrajanie zmienia wszystkie wagi; LoRA je zamraża i trenuje niewielką liczbę dodatkowych
- [ ] Pełne dostrajanie potrzebuje danych, a LoRA nie
- [ ] LoRA zmienia wszystkie wagi, tylko z mniejszym współczynnikiem uczenia
- [ ] Robią to samo, ale LoRA działa bez GPU

Metody oszczędne pod względem liczby parametrów, takie jak LoRA, trenują dużo mniej wag, więc wymagają dużo mniej pamięci.

## Do czego dostrajanie nadaje się najlepiej?

- [ ] Do podawania dzisiejszych cen
- [ ] Do odpowiadania na podstawie dokumentów napisanych po wytrenowaniu modelu
- [ ] Do zmieszczenia dłuższego dokumentu w prompcie
- [x] Do odpowiadania klientom w tonie i formacie firmy

Dostrajanie zmienia to, jak model się zachowuje, na przykład gdy trenuje się go na kilku tysiącach dawnych rozmów z działem obsługi klienta. Świeże fakty to zadanie dla RAG.
