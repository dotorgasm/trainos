# TRAIN/OS

Diario personale di allenamento, con tema nero e dati salvati nel browser.

## Programma 1.0

Dal programma fornito: lunedì Full Body; martedì Gambe + Spalle; mercoledì Petto + Tricipiti; giovedì Schiena + Bicipiti; venerdì o sabato Cardio base (5 + 30 + 5 minuti).

Si considera disponibile tutta l’attrezzatura. Le configurazioni UNICA segnalate sono ancora da verificare sul modello e sul manuale: la loro presenza nella scheda non è una verifica di compatibilità.

Settimane 1–2: una serie in meno per esercizio, minimo una. Settimane 3–4: serie complete del programma. La settimana è selezionata manualmente. Il volume ridotto delle prime due settimane rende esplicita l’indicazione del testo fornito.

Carichi iniziali vuoti da impostare; nei movimenti a corpo libero 0 indica nessuna zavorra. Kg per singolo manubrio oppure carico indicato sulla UNICA: la convenzione è visibile per ogni esercizio. Ripetizioni iniziali al limite inferiore dell’intervallo obiettivo. Ripetizioni e carichi effettivi vengono poi recuperati dalle serie completate dello stesso esercizio nella stessa scheda. Nessun incremento automatico. RIR opzionale per esercizio; spunte sempre nuove a ogni sessione.

## Aggiornare il sito esistente

1. Fai un backup da Dati se hai già registrato sessioni.
2. Carica tutti i file estratti dallo ZIP aggiornamento al livello principale del repository, sovrascrivendo quelli esistenti. Non caricare lo ZIP stesso.
3. Attendi la pubblicazione GitHub Pages, poi ricarica il sito.
4. Se era attiva la vecchia demo, tocca **Carica Training Program 1.0** e conferma. Lo storico resta; la bozza corrente viene sostituita. Il programma non viene sostituito di nascosto.
5. Scegli la seduta e la settimana. Imposta i carichi, registra serie e RIR o minuti per il cardio.

Puoi anche importare `programma-1.0.json` da Dati, dopo aver aggiornato l’app. Il file richiede la nuova versione per i carichi vuoti e i blocchi cardio.

## Primo avvio

GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root). Apri il sito in Safari e aggiungilo alla schermata Home. Per NFC usa lo stesso URL. Nessun invio automatico a ChatGPT: il report va copiato e incollato nella chat.

## Dati e riservatezza

Storico, note, RIR, motivi delle sessioni saltate e bozza sono salvati localmente (`train-os-v1`). Usa backup e ripristino JSON per conservarli o trasferirli. La modalità privata e la cancellazione dei dati del browser non sono adatte alla conservazione dello storico. Non modificare due finestre contemporaneamente. L’apertura della pagina richiede rete: non è garantita una cache offline.

Non caricare backup personali nel repository. Il sito contiene `noindex`, ma questo non rende privati sito o repository e non nasconde profilo GitHub o autori dei commit. Nessun nome personale è incluso nei file applicativi.

## Verifica

Test logici JavaScriptCore su macOS: `python3 tests/check.py`. Verificati vecchi backup, ciclo, carichi vuoti, riuso dei valori completati, RIR, forza/cardio, minuti effettivi, stati parziali/completi, motivi di salto e fallimenti di salvataggio. Test visivo sul dispositivo da completare.
