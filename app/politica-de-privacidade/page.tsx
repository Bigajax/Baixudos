import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  robots: { index: false },
};

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade">
      <p>
        A Baixudos.PR respeita a sua privacidade. Esta política explica quais dados coletamos
        pelo site, para que servem e quais são os seus direitos, em conformidade com a Lei Geral
        de Proteção de Dados (LGPD — Lei nº 13.709/2018).
      </p>
      <h2>Dados que coletamos</h2>
      <p>
        Coletamos apenas os dados que você informa voluntariamente nos formulários do site: nome,
        WhatsApp, e-mail, cidade, Instagram e as informações do veículo (na inscrição de
        projetos) ou da empresa (no contato comercial).
      </p>
      <h2>Para que usamos</h2>
      <p>
        Os dados são usados exclusivamente para: avaliar inscrições de veículos, responder
        contatos comerciais, enviar avisos sobre eventos para quem entrou na lista e operar os
        pedidos da loja. Não vendemos nem compartilhamos seus dados com terceiros para fins de
        marketing.
      </p>
      <h2>Cookies</h2>
      <p>
        Usamos cookies essenciais para o funcionamento do site e, apenas com o seu consentimento,
        cookies de análise e marketing. Você pode recusar os opcionais a qualquer momento pelo
        banner de cookies — o site continua funcionando normalmente.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo
        e-mail <strong>{site.email}</strong> ou pelo WhatsApp oficial da organização.
      </p>
    </LegalPage>
  );
}
