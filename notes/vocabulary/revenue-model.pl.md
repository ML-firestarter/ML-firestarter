---
description: Sposób, w jaki firma zarabia, czyli kto płaci, za co i jak ustalana jest cena.
---

# Model przychodów

Model przychodów odpowiada na trzy pytania: kto płaci, za co płaci i jak ustalana jest cena. Ten sam produkt można sprzedawać na różne sposoby.

Typowe modele przychodów produktów AI:

- **Subskrypcja**: stała opłata miesięczna albo roczna, jak w konsumenckim planie czatu.
- **Opłaty za zużycie**: płacisz za to, czego używasz. API modeli AI zwykle liczą sobie za milion [tokenów](token.pl.md), a tokeny wyjściowe kosztują więcej niż wejściowe.
- **Opłaty za użytkownika** (ang. per seat): opłata za każdą osobę korzystającą z produktu, typowa w planach dla firm.
- **Umowy korporacyjne**: negocjowane umowy z rabatami za wolumen, wsparciem i gwarancjami, na przykład prywatności danych.
- **Freemium**: darmowy plan, który przyciąga użytkowników, z limitami zachęcającymi najbardziej aktywnych do płacenia.
- **Reklamy**: produkt jest darmowy, a płacą reklamodawcy, żeby dotrzeć do jego użytkowników.

Produkty AI mają nietypową strukturę kosztów. Obsłużenie jednego użytkownika więcej w tradycyjnym oprogramowaniu nie kosztuje prawie nic, ale wygenerowanie każdej odpowiedzi AI wymaga czasu GPU (zob. [inferencja](inference.pl.md)). Dlatego ceny AI często zależą od zużycia, stałe subskrypcje mają limity, a [marża brutto](gross-margin.pl.md), czyli część przychodu, która zostaje po zapłaceniu za to, co sprzedano, przyciąga tyle uwagi.

Firma subskrypcyjna śledzi też [ARR](arr.pl.md) i [churn](churn.pl.md), a [ekonomika jednostkowa](unit-economics.pl.md) pokazuje, czy każdy klient jest wart tego, ile kosztuje jego pozyskanie.

**Przykład:** aplikacja czatu kosztuje 20 USD miesięcznie, a odpowiedź na każdą wiadomość kosztuje ją około 0,004 USD czasu GPU. Użytkownik, który wysyła 30 wiadomości dziennie, kosztuje około 3,60 USD miesięcznie (30 × 30 × 0,004 USD), co daje marżę brutto 82%. Użytkownik, który wysyła 1000 wiadomości dziennie, kosztuje 120 USD miesięcznie, czyli sześć razy więcej, niż płaci.

**Powiązane:** [Marża brutto](gross-margin.pl.md) · [ARR](arr.pl.md) · [Ekonomika jednostkowa](unit-economics.pl.md) · [Inferencja](inference.pl.md) · [Token](token.pl.md)
