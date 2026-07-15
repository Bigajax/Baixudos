import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Termos de Uso",
  robots: { index: false },
};

export default function TermosPage() {
  return (
    <LegalPage title="Termos de Uso">
      <p>
        Ao usar o site da Baixudos.PR você concorda com estes termos. Leia com atenção.
      </p>
      <h2>Sobre o site</h2>
      <p>
        Este site é o canal oficial da marca Baixudos.PR para divulgação de eventos, inscrição de
        veículos, catálogo de produtos e contato comercial. As informações de cada edição (data,
        local, lotes e regras) são publicadas quando confirmadas pela organização.
      </p>
      <h2>Ingressos</h2>
      <p>
        A venda de ingressos é realizada por plataforma externa oficial indicada nos botões do
        site. A operação de pagamento, entrega e suporte do ingresso segue as regras da
        plataforma responsável.
      </p>
      <h2>Inscrição de veículos</h2>
      <p>
        A inscrição de projetos passa por avaliação da equipe de curadoria e não garante
        aprovação automática. O envio de fotos e informações autoriza a organização a usá-las
        exclusivamente no processo de seleção.
      </p>
      <h2>Campanhas</h2>
      <p>
        Quando houver campanhas envolvendo veículos ou prêmios, a participação e toda a operação
        acontecem no ambiente da empresa promotora responsável, com regulamento, documentação e
        canal de suporte próprios, indicados na página da campanha.
      </p>
      <h2>Propriedade intelectual</h2>
      <p>
        A marca, a logo e o conteúdo do site pertencem à Baixudos.PR e não podem ser reproduzidos
        sem autorização.
      </p>
    </LegalPage>
  );
}
