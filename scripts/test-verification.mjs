import { verifyFlutterwaveTransaction } from '../lib/flutterwave/config.ts';

async function run() {
    process.env.FLUTTERWAVE_SECRET_KEY = "FLWSECK_TEST-b691566498506a9fe37bb50c1ca4c5ef-X";
    try {
        // Put in an arbitrary or real transaction id here if we had one.
        // I will just see if the fetch runs and trace it.
        const tx = await verifyFlutterwaveTransaction('123456');
        console.log("Success:", tx);
    } catch (e) {
        console.error("Failed:", e.message);
    }
}
run();
