---
description: Część przychodu, która zostaje po opłaceniu bezpośrednich kosztów dostarczenia tego, co sprzedano.
---

# Marża brutto

Marża brutto to część przychodu, która zostaje po zapłaceniu za to, co zostało sprzedane:

$$
\text{marża brutto} = \frac{\text{przychody} - \text{koszt własny sprzedaży}}{\text{przychody}}
$$

Koszt własny sprzedaży (ang. cost of goods sold, COGS) to koszt dostarczenia samego produktu. W oprogramowaniu to głównie hosting, a w produktach AI przede wszystkim czas GPU potrzebny na [inferencję](inference.pl.md), a do tego takie rzeczy jak obsługa klienta. Nie liczą się tu pensje w dziale badań, sprzedaży i marketingu; płaci się je z zysku brutto, który zostaje.

Tradycyjne firmy programistyczne często mają marżę brutto na poziomie 70–90%, bo obsłużenie jednego klienta więcej nie kosztuje prawie nic. Produkty AI mają zwykle niższe marże, bo każda odpowiedź wymaga obliczeń, a intensywny użytkownik może kosztować więcej, niż płaci. Dlatego [model przychodów](revenue-model.pl.md) i ceny (limity zużycia, ceny za token) są równie ważne jak sam produkt.

Marża brutto kształtuje też [ekonomikę jednostkową](unit-economics.pl.md): liczy się zysk brutto, który przynosi klient, a nie sam przychód od niego.

**Przykład:** aplikacja AI do pisania zarabia w kwartale 1 mln USD. Płaci 350 000 USD za wywołania API modeli i 50 000 USD za hosting i obsługę klienta. Jej zysk brutto to 600 000 USD, czyli marża brutto wynosi 60%.

**Powiązane:** [Model przychodów](revenue-model.pl.md) · [Ekonomika jednostkowa](unit-economics.pl.md) · [Inferencja](inference.pl.md) · [ARR](arr.pl.md)
