# Agent

## Czym agent różni się od chatbota?

- [ ] Działa na większym modelu
- [x] Dąży do celu w pętli, wybierając działania i widząc ich wyniki
- [ ] Uczy się z każdej rozmowy jeszcze w jej trakcie
- [ ] Odpowiada bez korzystania z okna kontekstowego

Chatbot odpowiada na jedną wiadomość naraz. Agent wybiera działanie, na przykład przeszukanie internetu albo wywołanie API, program je wykonuje, a wynik wraca do modelu, który decyduje, co dalej.

## Jak model w agencie korzysta z narzędzia?

- [ ] Uruchamia kod narzędzia wewnątrz modelu
- [ ] Najpierw trenuje się go od nowa na dokumentacji narzędzia
- [x] Pisze wywołanie narzędzia z jego nazwą i argumentami, a program je wykonuje
- [ ] Użytkownik uruchamia każde narzędzie i wkleja wynik z powrotem

Model sam niczego nie uruchamia. Pisze ustrukturyzowane żądanie, a otaczający go program je wykonuje i zwraca wynik.

## Dlaczego agenci zwykle mają limity i pytają o zgodę przed ryzykownymi działaniami?

- [x] Zły wynik na początku może wykoleić wszystkie kolejne kroki
- [x] Narzędzia takie jak poczta, pliki czy płatności zwiększają stawkę każdego błędu
- [ ] Model może wywołać tylko jedno narzędzie na zadanie
- [ ] Limity sprawiają, że odpowiedzi modelu są dokładniejsze

Błędy kumulują się z kroku na krok, a im więcej agent może zrobić, tym więcej może kosztować pomyłka.

## Agent pracuje nad długim zadaniem. Co się dzieje z jego oknem kontekstowym?

- [ ] Nic, bo wyniki narzędzi się nie liczą
- [ ] Rośnie, żeby zmieścić całe zadanie
- [x] Zapełnia się, bo każdy krok wydłuża rozmowę, którą widzi model
- [ ] Jest czyszczone po każdym wywołaniu narzędzia

Każde działanie i każdy wynik trafia do rozmowy, więc długie zadania mogą zapełnić okno.

## Co oznacza „agent” w uczeniu przez wzmacnianie?

- [x] Każdy uczący się system, który działa w jakimś środowisku
- [ ] Tylko model językowy, który korzysta z narzędzi
- [ ] Program, który przydziela nagrody
- [ ] Osobę, która oznacza dane treningowe

W RL agent to ten, kto się uczy; działa zgodnie ze swoją polityką. Oba znaczenia się spotykają, bo agentów opartych na modelach językowych często trenuje się za pomocą RL na zadaniach wymagających wielu kroków.
