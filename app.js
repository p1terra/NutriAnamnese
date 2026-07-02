// Importando o Firebase (versão modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// SUAS CONFIGURAÇÕES DO FIREBASE AQUI
// Substitua este bloco pelas chaves do seu projeto geradas no painel do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD4xkcSwFvOVyt6iXkRSeVRZKR23bINei4",
  authDomain: "anamnesediaria.firebaseapp.com",
  projectId: "anamnesediaria",
  storageBucket: "anamnesediaria.firebasestorage.app",
  messagingSenderId: "905042038319",
  appId: "1:905042038319:web:2606ba0b09da6233ee00da"
};

// Inicializar App e Banco de Dados
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lógica de Envio do Formulário
document.getElementById('anamneseForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o reload da página

    const form = e.target;
    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = "Salvando...";

    try {
        // A mágica acontece aqui: FormData captura todos os inputs com a propriedade 'name' preenchida
        const formData = new FormData(form);
        
        // Transforma todos os dados capturados em um objeto JSON organizado
        const anamneseData = Object.fromEntries(formData.entries());

        // Adiciona a marca temporal exata do envio no sistema
        anamneseData.timestamp_envio = new Date().toISOString();

        // Envia o objeto JSON inteiro para a coleção "anamneses" no Firestore
        const docRef = await addDoc(collection(db, "anamneses"), anamneseData);
        
        alert("Questionário salvo com sucesso!\nID do registro: " + docRef.id);
        
        // Limpa o formulário e rola a tela para cima após o sucesso
        form.reset();
        window.scrollTo(0, 0);

    } catch (error) {
        console.error("Erro ao salvar documento: ", error);
        alert("Houve um erro ao salvar. Verifique o console ou a sua conexão com a internet.");
    } finally {
        // Restaura o botão
        btn.disabled = false;
        btn.textContent = "Salvar Questionário Diário";
    }
});