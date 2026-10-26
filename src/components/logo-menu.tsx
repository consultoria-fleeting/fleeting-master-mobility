/**
 * LogoMenu — Marca exibida no topo do menu lateral.
 *
 * - Menu recolhido: ícone pequeno do Master Mobility (`iconeSite.png`), em branco.
 * - Menu expandido: logo do Master Mobility (`logo.png`), em branco.
 * - Menu expandido nas rotas do Ranking de Condutores: logo do DriverScore
 *   (`DriverScore_Horizontal_Negativo.svg`), já nas cores corretas.
 *
 * Os PNGs originais são azuis; o filtro `brightness-0 invert` os deixa brancos
 * sem precisar de uma segunda versão do arquivo.
 *
 * As imagens são importadas estaticamente (não via "/logo.png") para irem para
 * `_next/static/media` e respeitarem o `assetPrefix` do Multi-Zone; uma URL
 * "/logo.png" no domínio principal seria servida pelo projeto legado.
 */

import Image from "next/image";
import logoDriverScore from "../../public/DriverScore_Horizontal_Negativo.svg";
import iconeMasterMobility from "../../public/iconeSite.png";
import logoMasterMobility from "../../public/logo.png";
import { cn } from "@/lib/utils";

interface LogoMenuProps {
  /** Menu lateral recolhido (apenas ícones) */
  colapsado: boolean;
  /** Rota atual pertence ao Ranking de Condutores (exibe a marca DriverScore) */
  ehRankingCondutores: boolean;
}

/** Deixa as imagens azuis totalmente brancas */
const CLASSE_BRANCO = "brightness-0 invert";

export function LogoMenu({ colapsado, ehRankingCondutores }: LogoMenuProps) {
  if (colapsado) {
    return (
      <Image
        src={iconeMasterMobility}
        alt="Master Mobility"
        unoptimized
        priority
        className={cn("h-auto w-6 shrink-0", CLASSE_BRANCO)}
      />
    );
  }

  if (ehRankingCondutores) {
    return (
      <Image
        src={logoDriverScore}
        alt="DriverScore — Ranking de Condutores"
        unoptimized
        priority
        className="h-auto w-44 max-w-full"
      />
    );
  }

  return (
    <Image
      src={logoMasterMobility}
      alt="Master Mobility by Fleeting"
      unoptimized
      priority
      className={cn("h-auto w-46 max-w-full", CLASSE_BRANCO)}
    />
  );
}
