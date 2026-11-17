/**
 * LogoMenu — Marca exibida no topo do menu lateral.
 *
 * - Menu recolhido nas rotas do DriverScore (`/ranking-condutores*`):
 *   ícone vetorial do DriverScore (`DriverScore_Icone_Negativo.svg`), sem texto.
 * - Menu recolhido nas demais rotas:
 *   ícone do Master Mobility (`iconeSite.png`), em branco.
 * - Menu expandido nas rotas do DriverScore (`/ranking-condutores*`):
 *   logo horizontal do DriverScore (`DriverScore_Horizontal_Negativo.svg`).
 * - Menu expandido nas demais rotas:
 *   logo do Master Mobility (`logo.png`), em branco.
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
import iconeDriverScore from "../../public/DriverScore_Icone_Negativo.svg";
import iconeMasterMobility from "../../public/iconeSite.png";
import logoMasterMobility from "../../public/logo.png";
import { cn } from "@/lib/utils";

interface LogoMenuProps {
  /** Menu lateral recolhido (apenas ícones) */
  colapsado: boolean;
  /** Rota atual pertence ao DriverScore (`/ranking-condutores*`) */
  ehRankingCondutores: boolean;
}

/** Deixa as imagens azuis totalmente brancas */
const CLASSE_BRANCO = "brightness-0 invert";

export function LogoMenu({ colapsado, ehRankingCondutores }: LogoMenuProps) {
  if (colapsado) {
    if (ehRankingCondutores) {
      return (
        <Image
          src={iconeDriverScore}
          alt="DriverScore"
          unoptimized
          preload
          className="h-auto w-9 shrink-0"
        />
      );
    }

    return (
      <Image
        src={iconeMasterMobility}
        alt="Master Mobility"
        unoptimized
        preload
        className={cn("h-auto w-9 shrink-0", CLASSE_BRANCO)}
      />
    );
  }

  if (ehRankingCondutores) {
    return (
      <Image
        src={logoDriverScore}
        alt="DriverScore"
        unoptimized
        preload
        className="h-auto w-44 max-w-full"
      />
    );
  }

  return (
    <Image
      src={logoMasterMobility}
      alt="Master Mobility by Fleeting"
      unoptimized
      preload
      className={cn("h-auto w-46 max-w-full", CLASSE_BRANCO)}
    />
  );
}
