import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Cookies",
  robots: { index: false },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies">
      <p>
        Cookies são pequenos arquivos salvos no seu navegador que ajudam o site a funcionar e a
        entender como ele é usado. Aqui explicamos cada categoria usada pela Baixudos.PR.
      </p>
      <h2>Essenciais</h2>
      <p>
        Necessários para o funcionamento básico do site — como lembrar a sua escolha de
        consentimento. Não podem ser desativados.
      </p>
      <h2>Análise</h2>
      <p>
        Usados apenas com o seu consentimento para entender o uso das páginas (ex.: Google
        Analytics) e melhorar a experiência. Nenhum dado é coletado antes do seu aceite.
      </p>
      <h2>Marketing</h2>
      <p>
        Usados apenas com o seu consentimento para medir campanhas (ex.: Meta Pixel). Nenhum
        evento de marketing é disparado antes do seu aceite.
      </p>
      <h2>Como gerenciar</h2>
      <p>
        Você pode alterar sua escolha limpando os dados do site no navegador — o banner de
        consentimento será exibido novamente na próxima visita. O site permanece totalmente
        funcional se você recusar os cookies opcionais.
      </p>
    </LegalPage>
  );
}
