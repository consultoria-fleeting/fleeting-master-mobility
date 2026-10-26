/**
 * DriverLink — Nome do condutor com link para a tela de performance individual.
 *
 * Sempre usa o UUID (`driverId`) na rota, nunca o nome.
 *
 * @example
 * <DriverLink driverId={item.id} nome={item.driver} />
 */

import Link from "next/link";
import { getDriverPerformancePath } from "@/utils/driver-scoring-helpers";

interface DriverLinkProps {
  driverId: string;
  nome: string;
}

export function DriverLink({ driverId, nome }: DriverLinkProps) {
  return (
    <Link
      href={getDriverPerformancePath(driverId)}
      className="font-medium text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
    >
      {nome}
    </Link>
  );
}
