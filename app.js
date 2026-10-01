// Importando o Firebase (versão modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// ==========================================
// 1. LÓGICA DE SALVAR O FORMULÁRIO
// ==========================================
document.getElementById('anamneseForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o reload da página

    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Salvando no banco de dados...";

    try {
        // Captura todos os dados preenchidos
        const formData = new FormData(form);
        const anamneseData = Object.fromEntries(formData.entries());

        // Adiciona a marca temporal exata do envio no sistema
        anamneseData.timestamp_envio = new Date().toISOString();

        // Envia para a coleção "anamneses" no Firestore
        const docRef = await addDoc(collection(db, "anamneses"), anamneseData);
        
        alert("Questionário salvo com sucesso!\nID do registro: " + docRef.id);
        
        // Limpa o formulário e rola a tela para cima
        form.reset();
        window.scrollTo(0, 0);

    } catch (error) {
        console.error("Erro ao salvar documento: ", error);
        alert("Houve um erro ao salvar. Verifique o console e certifique-se de ter colado o código firebaseConfig correto no app.js.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Salvar Questionário Diário";
    }
});

// ==========================================
// 2. LÓGICA DE EXPORTAR PARA EXCEL
// ==========================================
document.getElementById('btnExportar').addEventListener('click', async () => {
    const btnExportar = document.getElementById('btnExportar');
    btnExportar.disabled = true;
    btnExportar.textContent = "Baixando dados... Aguarde.";

    // Capturando os filtros escolhidos pelo usuário
    const filtroParticipante = document.getElementById('export_participante').value;
    const filtroDataInicio = document.getElementById('export_data_inicio').value; // Formato: YYYY-MM-DD
    const filtroDataFim = document.getElementById('export_data_fim').value;

    try {
        // Baixa TODOS os registros da coleção (como é texto, é bem leve)
        const querySnapshot = await getDocs(collection(db, "anamneses"));
        let dadosFiltrados = [];

        querySnapshot.forEach((doc) => {
            let data = doc.data();
            
            // FILTRO 1: Participante
            if (filtroParticipante !== "Todos" && data.participante !== filtroParticipante) {
                return; // Pula este registro se não for da pessoa escolhida
            }

            // FILTRO 2: Data Inicial
            if (filtroDataInicio && data.data_registro < filtroDataInicio) {
                return; // Pula se a data do registro for anterior ao filtro
            }

            // FILTRO 3: Data Final
            if (filtroDataFim && data.data_registro > filtroDataFim) {
                return; // Pula se a data do registro for posterior ao filtro
            }

            dadosFiltrados.push(data);
        });

        if (dadosFiltrados.length === 0) {
            alert("Nenhum dado encontrado com os filtros selecionados.");
            return;
        }

        // Criando a planilha Excel usando a biblioteca SheetJS
        // O json_to_sheet transforma as propriedades do JSON automaticamente em colunas
        const worksheet = XLSX.utils.json_to_sheet(dadosFiltrados);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Anamneses");

        // Nome do arquivo gerado
        const nomeArquivo = `Anamnese_${filtroParticipante}_${new Date().getTime()}.xlsx`;

        // Força o download do arquivo .xlsx
        XLSX.writeFile(workbook, nomeArquivo);

    } catch (error) {
        console.error("Erro ao exportar dados: ", error);
        alert("Erro ao gerar o Excel. Verifique o console.");
    } finally {
        btnExportar.disabled = false;
        btnExportar.textContent = "Baixar Planilha Excel (.xlsx)";
    }
});
