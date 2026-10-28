# TRAIN/OS · Palestra Casa

Prototipo mobile-first, senza account, dipendenze, build o servizi esterni. HTML/CSS/JavaScript statici, pronti per GitHub Pages. Il progetto non è ancora pubblicato.

## Provalo su iPhone — percorso consigliato

1. Estrai lo ZIP sul Mac. Crea un repository GitHub chiamato `train-os` (pubblico se usi GitHub Free).
2. Carica **il contenuto** di questa cartella nel repository, con `index.html` al livello principale. Non caricare lo ZIP e non lasciare `index.html` dentro una sottocartella `train-os`.
3. In GitHub apri **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
4. Attendi la pubblicazione e apri su iPhone, in Safari, l’URL indicato da GitHub Pages: normalmente `https://TUO-UTENTE.github.io/train-os/`.
5. In Safari apri **Condividi → Aggiungi alla schermata Home**; abilita “Apri come app web” se presente, poi Aggiungi. Le voci possono variare con la versione di iOS.
6. Usa sempre lo stesso accesso (Safari oppure icona Home) e fai un backup prima di cambiarlo: contenitori diversi possono avere archivi locali separati.

I file della web app sono pubblici se pubblicati su Pages; lo storico è scritto soltanto nel browser. Non caricare nel repository i tuoi backup personali.

Riferimenti: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Safari su iPhone](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios).

## Prova rapida: due minuti

- Apri Allenamento: trovi la scheda demo Full Body con 5 esercizi. I primi valori sono illustrativi, non una prescrizione personale.
- Cambia un carico, spunta una o due serie, aggiungi una nota se vuoi. La bozza viene salvata a ogni modifica valida, comprese le spunte.
- Ricarica: la bozza deve essere ancora lì.
- Tocca **Salva allenamento** e conferma: puoi salvare anche una sessione parziale. Nello storico sono distinte serie fatte e non fatte.
- Torna ad Allenamento: carichi e ripetizioni arrivano dall’ultima sessione dello stesso esercizio/scheda. Le spunte sono vuote, perché la nuova sessione non è ancora svolta. Nessun carico viene aumentato automaticamente.
- Tocca **Oggi salto**, scegli il motivo, conferma. Lo storico conserva motivo, gruppi previsti e nota, senza creare un “debito” da recuperare automaticamente.
- Apri **Storico → Copia report**, quindi incolla manualmente nella chat ChatGPT desiderata. Se la copia non è disponibile, seleziona e copia il testo nel riquadro.
- In **Dati**, scarica un backup, poi usa Ripristina backup per verificare il recupero. Il ripristino sostituisce i dati correnti, dopo conferma.

I kg demo sono per singolo manubrio e le ripetizioni dei movimenti unilaterali sono per lato. Restano sempre modificabili. Non c’è uno storico fittizio spacciato per allenamenti reali.

## NFC

Il tag deve aprire l’URL HTTPS della tua installazione. Puoi scrivere sul tag un record URL con un’app NFC compatibile, oppure associare il tag a un’automazione NFC in Comandi Rapidi con l’azione “Apri URL” e quell’indirizzo. Disponibilità e conferme dipendono da iPhone/iOS.

Il tag apre la web app: non trasferisce dati, non invia report e non attiva integrazioni con ChatGPT. Nessuna chiave API o credenziale è necessaria. Preferisci lo stesso browser usato per registrare le sessioni.

## Programmi JSON, senza cambiare codice

Scarica o modifica `programma-demo.json`, poi usa **Dati → Importa programma JSON**. L’importazione sostituisce programma e bozza dopo conferma, mantenendo lo storico. Puoi aggiungere più schede: compaiono nel selettore Allenamento.

Formato versione 1:

```json
{
  "schemaVersion": 1,
  "name": "Palestra Casa",
  "workouts": [{
    "id": "full-body",
    "name": "Full Body",
    "description": "La mia scheda",
    "exercises": [{
      "id": "squat",
      "name": "Goblet squat",
      "muscles": ["Gambe", "Glutei"],
      "rest": "90 sec",
      "sets": [{"kg": 16, "reps": 10}]
    }]
  }]
}
```

Mantieni stabili gli ID per riutilizzare i carichi precedenti. Cambia ID quando cambia il significato dell’esercizio o l’unità di carico. ID scheda univoci nel programma, ID esercizio univoci nella scheda. Da 1 a 30 schede, da 1 a 40 esercizi, da 1 a 20 serie. Kg 0–1000, ripetizioni intere 0–1000. I file non validi vengono rifiutati senza sostituire i dati. Massimo file 10 MB.

## Dati e limiti della demo

- `localStorage`, chiave `train-os-v1`: programma, sessioni complete/parziali/saltate e bozza.
- Backup JSON completo e ripristino con validazione. Se l’archivio è illeggibile, il pulsante backup scarica il contenuto originale per il recupero e l’app evita di sovrascriverlo.
- Nessuna sincronizzazione fra dispositivi o schede browser: evita di modificare due finestre contemporaneamente.
- Memoria del browser cancellata, navigazione privata e spazio esaurito possono compromettere la persistenza. Fai backup periodici e prima degli aggiornamenti/cambi di URL. Se un salvataggio fallisce, compare un avviso.
- Richiede rete per aprire/ricaricare la pagina: questa versione non include una cache offline garantita. Una pagina già aperta registra localmente anche senza rete.
- Nessun collegamento automatico a ChatGPT, invio in background o modifica automatica del programma.

## Anteprima sul Mac (facoltativa)

Da Terminale nella cartella estratta:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Apri `http://localhost:8080`. Per provare su iPhone usa il percorso GitHub Pages sopra; `localhost` sull’iPhone indica l’iPhone stesso. Il doppio clic su `index.html` non è il percorso consigliato per verificare la persistenza.

## Verifiche effettuate

Test logici sul motore JavaScriptCore di macOS: salvataggio bozza, sessione parziale, riuso carichi, reset spunte, sessione saltata, report, validazione backup/programma e rollback per memoria piena. Ripetibili su macOS con `python3 tests/check.py`.

Anteprima HTTP e test visivo su iPhone non eseguiti: l’ambiente di preparazione non consente di avviare il server locale. La prova rapida sopra è la checklist per verificare Safari e il dispositivo reale.
