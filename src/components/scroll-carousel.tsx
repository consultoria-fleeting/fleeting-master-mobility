/**
 * ScrollCarousel — Carrossel horizontal com drag-to-scroll e setas de navegação
 *
 * Esconde a scrollbar nativa e permite arrastar com o mouse/toque.
 * Exibe setas de navegação nos cantos quando há conteúdo fora da tela.
 *
 * Reutilizável para qualquer conteúdo que precise de scroll horizontal elegante.
 *
 * @example
 * <ScrollCarousel>
 *   {itens.map(item => <Card key={item.id} />)}
 * </ScrollCarousel>
 */

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollCarouselProps {
  children: React.ReactNode;
  /** Espaçamento entre os itens (classes Tailwind, ex: "gap-3") */
  gap?: string;
  /** Classe CSS adicional para o container */
  className?: string;
}

export function ScrollCarousel({
  children,
  gap = "gap-3",
  className = "",
}: ScrollCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [podeMoverEsquerda, setPodeMoverEsquerda] = useState(false);
  const [podeMoverDireita, setPodeMoverDireita] = useState(false);

  /* ---------- Verificar visibilidade das setas ---------- */
  const verificarScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setPodeMoverEsquerda(el.scrollLeft > 2);
    setPodeMoverDireita(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    verificarScroll();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", verificarScroll, { passive: true });
    const observer = new ResizeObserver(verificarScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", verificarScroll);
      observer.disconnect();
    };
  }, [verificarScroll]);

  /* ---------- Scroll por botão ---------- */
  function scrollPor(direcao: "esquerda" | "direita") {
    const el = containerRef.current;
    if (!el) return;
    const distancia = el.clientWidth * 0.7;
    el.scrollBy({
      left: direcao === "direita" ? distancia : -distancia,
      behavior: "smooth",
    });
  }

  /* ---------- Drag-to-scroll ---------- */
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  function handleMouseDown(e: React.MouseEvent) {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    el.scrollLeft = scrollLeftStart.current - walk;
  }

  function handleMouseUp() {
    isDragging.current = false;
    const el = containerRef.current;
    if (!el) return;
    el.style.cursor = "grab";
    el.style.userSelect = "";
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Seta esquerda */}
      {podeMoverEsquerda && (
        <button
          onClick={() => scrollPor("esquerda")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll para esquerda"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Container de scroll */}
      <div
        ref={containerRef}
        className={`flex ${gap} overflow-x-auto cursor-grab scroll-smooth`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {children}
      </div>

      {/* Seta direita */}
      {podeMoverDireita && (
        <button
          onClick={() => scrollPor("direita")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/90 border border-border shadow-md flex items-center justify-center hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
          aria-label="Scroll para direita"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Fade visual no canto direito quando há mais conteúdo */}
      {podeMoverDireita && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none" />
      )}
    </div>
  );
}
