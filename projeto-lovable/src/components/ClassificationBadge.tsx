interface Props {
  classificacao: 'referencia' | 'baixa' | 'media' | 'alta';
  size?: 'sm' | 'md';
}

const labels: Record<string, string> = {
  referencia: 'Referência',
  baixa: 'Baixa Exposição',
  media: 'Média Exposição',
  alta: 'Alta Exposição',
};

const styles: Record<string, string> = {
  referencia: 'classification-referencia',
  baixa: 'classification-baixa',
  media: 'classification-media',
  alta: 'classification-alta',
};

export default function ClassificationBadge({ classificacao, size = 'sm' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${styles[classificacao]} ${size === 'sm' ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}>
      {labels[classificacao]}
    </span>
  );
}
