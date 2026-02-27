import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';

// Need to import firebase config.
import { firebaseConfig } from '../src/firebase/config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateProteinsToKg() {
    console.log("Starting update...");
    const inventoryRef = collection(db, 'inventory');

    // Fetch all items since we might need to filter by name using JS (to do fuzzy/includes search)
    // or we can just fetch all and filter.
    const snapshot = await getDocs(inventoryRef);

    let updatedCount = 0;
    const keywords = ['carne', 'pollo', 'chuleta', 'pescado', 'res', 'cerdo'];

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const nombre = (data.nombre || '').toLowerCase();

        // Check if it's a protein
        const isProtein = keywords.some(keyword => nombre.includes(keyword)) || data.categoriaId === 'carnes';

        if (isProtein) {
            const updates: any = {};
            let needsUpdate = false;

            if (data.unidadReceta !== 'kg') {
                updates.unidadReceta = 'kg';
                needsUpdate = true;
            }

            if (data.unidadCompra !== 'kg') {
                // If it was bought in different units, we might just set it to kg or leave it. 
                // The prompt says "expresadas en kilogramos". Usually this means recipe unit.
                // Let's set both to ensure consistency if they are proteins.
                updates.unidadCompra = 'kg';
                updates.factorConversion = 1;
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log(`Updating ${data.nombre} (ID: ${docSnap.id}) to kg...`);
                await updateDoc(doc(db, 'inventory', docSnap.id), updates);
                updatedCount++;
            }
        }
    }

    console.log(`Finished updating. ${updatedCount} items updated.`);
    process.exit(0);
}

updateProteinsToKg().catch(console.error);
