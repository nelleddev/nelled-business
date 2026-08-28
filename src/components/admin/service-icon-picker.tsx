"use client";

import {
  Search,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  SERVICE_ICON_NAMES,
  ServiceIcon,
  isValidServiceIconName,
  type ServiceIconName,
} from "@/components/service-icon";

type ServiceIconPickerProps = {
  name: string;
  defaultValue?: string | null;
  label?: string;
};

type IconCategory = {
  id: string;
  label: string;
  icons?: string[];
};

const INITIAL_VISIBLE_ICONS = 96;
const LOAD_MORE_AMOUNT = 96;

const ICON_CATEGORIES: IconCategory[] = [
  {
    id: "recommended",
    label: "Recomendados",
    icons: [
      "hammer",
      "wrench",
      "drill",
      "construction",
      "hard-hat",
      "brick-wall",
      "house",
      "building",
      "ruler",
      "pencil-ruler",
      "panels-top-left",
      "panel-top",
      "paintbrush",
      "paint-roller",
      "palette",
      "snowflake",
      "fan",
      "wind",
      "thermometer",
      "air-vent",
      "zap",
      "lightbulb",
      "plug",
      "cable",
      "solar-panel",
      "battery-charging",
      "droplets",
      "shower-head",
      "pipette",
      "cctv",
      "camera",
      "shield-check",
      "siren",
      "bell-ring",
      "lock-keyhole",
      "radio-tower",
      "wifi",
      "router",
      "server",
      "monitor",
      "laptop",
      "printer",
      "leaf",
      "tree-pine",
      "trees",
      "flower-2",
      "sparkles",
      "brush-cleaning",
      "car",
      "bike",
      "truck",
      "motorcycle",
      "scissors",
      "heart",
      "stethoscope",
      "utensils",
      "chef-hat",
      "coffee",
      "package",
      "map-pin",
      "video",
      "music",
      "briefcase",
      "tool-case",
      "settings",
    ],
  },

  {
    id: "construction",
    label: "Construção",
    icons: [
      "hammer",
      "wrench",
      "drill",
      "construction",
      "hard-hat",
      "brick-wall",
      "house",
      "building",
      "building-2",
      "warehouse",
      "ruler",
      "pencil-ruler",
      "drafting-compass",
      "panels-top-left",
      "panel-top",
      "columns-3",
      "blocks",
      "square",
      "rectangle-horizontal",
      "door-open",
      "door-closed",
      "stairs",
      "fence",
      "shovel",
      "pickaxe",
      "anvil",
      "nut",
      "bolt",
      "screwdriver",
    ],
  },

  {
    id: "painting",
    label: "Pintura e acabamento",
    icons: [
      "paintbrush",
      "paintbrush-vertical",
      "paint-roller",
      "palette",
      "pipette",
      "spray-can",
      "sparkles",
      "wand-sparkles",
      "swatch-book",
      "brush",
      "eraser",
    ],
  },

  {
    id: "electric",
    label: "Elétrica",
    icons: [
      "zap",
      "zap-off",
      "lightbulb",
      "lightbulb-off",
      "lamp",
      "lamp-ceiling",
      "plug",
      "plug-zap",
      "cable",
      "cable-car",
      "battery",
      "battery-charging",
      "battery-full",
      "power",
      "power-circle",
      "utility-pole",
      "solar-panel",
      "sun",
      "gauge",
    ],
  },

  {
    id: "climate",
    label: "Climatização",
    icons: [
      "snowflake",
      "fan",
      "wind",
      "air-vent",
      "thermometer",
      "thermometer-snowflake",
      "thermometer-sun",
      "cloud-snow",
      "sun",
      "flame",
      "waves",
    ],
  },

  {
    id: "hydraulic",
    label: "Hidráulica",
    icons: [
      "droplet",
      "droplets",
      "waves",
      "shower-head",
      "bath",
      "washing-machine",
      "wrench",
      "gauge",
      "flask-conical",
      "container",
    ],
  },

  {
    id: "security",
    label: "Segurança",
    icons: [
      "cctv",
      "camera",
      "video",
      "shield",
      "shield-check",
      "shield-alert",
      "shield-user",
      "siren",
      "bell",
      "bell-ring",
      "lock",
      "lock-keyhole",
      "key-round",
      "key-square",
      "scan-face",
      "scan-eye",
      "fingerprint",
      "radio-tower",
      "radio",
      "eye",
      "badge-check",
    ],
  },

  {
    id: "technology",
    label: "TI e redes",
    icons: [
      "monitor",
      "monitor-cog",
      "laptop",
      "computer",
      "server",
      "server-cog",
      "database",
      "hard-drive",
      "wifi",
      "wifi-high",
      "ethernet-port",
      "router",
      "network",
      "cloud",
      "cloud-cog",
      "printer",
      "keyboard",
      "mouse",
      "smartphone",
      "tablet",
      "cpu",
      "memory-stick",
      "cable",
      "terminal",
      "code-2",
      "binary",
      "globe",
    ],
  },

  {
    id: "woodwork",
    label: "Marcenaria",
    icons: [
      "hammer",
      "ruler",
      "pencil-ruler",
      "drill",
      "panels-top-left",
      "panel-top",
      "square",
      "table",
      "armchair",
      "bed",
      "door-open",
      "house",
      "tree-pine",
    ],
  },

  {
    id: "garden",
    label: "Jardinagem",
    icons: [
      "leaf",
      "trees",
      "tree-pine",
      "tree-deciduous",
      "flower",
      "flower-2",
      "sprout",
      "shrub",
      "shovel",
      "scissors",
      "sun",
      "cloud-sun",
      "droplets",
      "bug",
    ],
  },

  {
    id: "cleaning",
    label: "Limpeza",
    icons: [
      "sparkles",
      "brush-cleaning",
      "spray-can",
      "trash-2",
      "washing-machine",
      "shirt",
      "droplets",
      "soap-dispenser-droplet",
      "house",
      "building",
    ],
  },

  {
    id: "automotive",
    label: "Automotivo",
    icons: [
      "car",
      "car-front",
      "truck",
      "bike",
      "motorcycle",
      "bus",
      "tractor",
      "fuel",
      "battery",
      "battery-charging",
      "gauge",
      "wrench",
      "settings",
      "circle-gauge",
      "circle-parking",
    ],
  },

  {
    id: "beauty",
    label: "Beleza",
    icons: [
      "scissors",
      "sparkles",
      "heart",
      "star",
      "smile",
      "user",
      "users",
      "palette",
      "flower-2",
      "crown",
      "gem",
      "brush",
    ],
  },

  {
    id: "health",
    label: "Saúde",
    icons: [
      "heart",
      "heart-pulse",
      "activity",
      "stethoscope",
      "cross",
      "hospital",
      "pill",
      "syringe",
      "thermometer",
      "ambulance",
      "accessibility",
      "brain",
      "eye",
      "ear",
      "tooth",
    ],
  },

  {
    id: "food",
    label: "Alimentação",
    icons: [
      "utensils",
      "utensils-crossed",
      "chef-hat",
      "cooking-pot",
      "coffee",
      "cup-soda",
      "pizza",
      "sandwich",
      "cake",
      "cake-slice",
      "ice-cream-bowl",
      "wine",
      "beer",
      "apple",
      "banana",
      "beef",
      "fish",
      "wheat",
    ],
  },

  {
    id: "transport",
    label: "Transporte e entregas",
    icons: [
      "truck",
      "car",
      "bike",
      "motorcycle",
      "bus",
      "ship",
      "plane",
      "package",
      "package-check",
      "package-open",
      "boxes",
      "warehouse",
      "map",
      "map-pin",
      "navigation",
      "route",
    ],
  },

  {
    id: "events",
    label: "Eventos e mídia",
    icons: [
      "camera",
      "video",
      "images",
      "image",
      "music",
      "music-2",
      "mic",
      "speaker",
      "party-popper",
      "cake",
      "calendar",
      "ticket",
      "clapperboard",
      "projector",
      "presentation",
      "lightbulb",
      "sparkles",
    ],
  },

  {
    id: "professional",
    label: "Profissional",
    icons: [
      "briefcase",
      "tool-case",
      "badge-check",
      "circle-check",
      "clipboard-check",
      "clipboard-list",
      "list-checks",
      "settings",
      "cog",
      "users",
      "user-check",
      "handshake",
      "medal",
      "award",
      "star",
      "house",
    ],
  },

  {
    id: "all",
    label: "Todos",
  },
];

const SEARCH_GROUPS: Array<{
  terms: string[];
  icons: string[];
}> = [
  {
    terms: [
      "pedreiro",
      "pedreira",
      "obra",
      "obras",
      "construcao",
      "construção",
      "alvenaria",
      "reforma",
    ],
    icons: [
      "brick-wall",
      "hammer",
      "construction",
      "hard-hat",
      "house",
      "building",
      "drill",
      "ruler",
    ],
  },

  {
    terms: [
      "forro",
      "forros",
      "gesso",
      "drywall",
      "divisoria",
      "divisória",
      "sanca",
      "acabamento",
    ],
    icons: [
      "panels-top-left",
      "panel-top",
      "columns-3",
      "ruler",
      "hammer",
      "house",
      "square",
    ],
  },

  {
    terms: [
      "pintor",
      "pintura",
      "pinturas",
      "tinta",
      "cor",
    ],
    icons: [
      "paintbrush",
      "paintbrush-vertical",
      "paint-roller",
      "palette",
      "spray-can",
    ],
  },

  {
    terms: [
      "eletricista",
      "eletrica",
      "elétrica",
      "energia",
      "tomada",
      "fiacao",
      "fiação",
    ],
    icons: [
      "zap",
      "lightbulb",
      "plug",
      "cable",
      "utility-pole",
      "battery-charging",
    ],
  },

  {
    terms: [
      "ar condicionado",
      "ar-condicionado",
      "climatizacao",
      "climatização",
      "refrigeracao",
      "refrigeração",
    ],
    icons: [
      "snowflake",
      "fan",
      "wind",
      "air-vent",
      "thermometer-snowflake",
    ],
  },

  {
    terms: [
      "encanador",
      "hidraulica",
      "hidráulica",
      "agua",
      "água",
      "cano",
      "vazamento",
    ],
    icons: [
      "droplets",
      "droplet",
      "shower-head",
      "bath",
      "wrench",
    ],
  },

  {
    terms: [
      "camera",
      "câmera",
      "cftv",
      "alarme",
      "seguranca",
      "segurança",
      "monitoramento",
      "controle de acesso",
      "interfone",
    ],
    icons: [
      "cctv",
      "camera",
      "shield-check",
      "siren",
      "bell-ring",
      "lock-keyhole",
      "fingerprint",
      "radio-tower",
    ],
  },

  {
    terms: [
      "informatica",
      "informática",
      "ti",
      "computador",
      "notebook",
      "rede",
      "redes",
      "internet",
      "wifi",
      "servidor",
    ],
    icons: [
      "monitor",
      "laptop",
      "server",
      "wifi",
      "router",
      "network",
      "database",
      "computer",
    ],
  },

  {
    terms: [
      "marceneiro",
      "marcenaria",
      "moveis",
      "móveis",
      "madeira",
    ],
    icons: [
      "hammer",
      "ruler",
      "drill",
      "panels-top-left",
      "table",
      "armchair",
    ],
  },

  {
    terms: [
      "serralheiro",
      "serralheria",
      "metal",
      "solda",
      "soldador",
      "portao",
      "portão",
    ],
    icons: [
      "anvil",
      "hammer",
      "wrench",
      "construction",
      "fence",
      "settings",
    ],
  },

  {
    terms: [
      "jardineiro",
      "jardinagem",
      "jardim",
      "poda",
      "paisagismo",
      "grama",
    ],
    icons: [
      "leaf",
      "trees",
      "tree-pine",
      "flower-2",
      "sprout",
      "shovel",
      "scissors",
    ],
  },

  {
    terms: [
      "limpeza",
      "faxina",
      "diarista",
      "higienizacao",
      "higienização",
    ],
    icons: [
      "sparkles",
      "brush-cleaning",
      "spray-can",
      "washing-machine",
      "house",
    ],
  },

  {
    terms: [
      "mecanico",
      "mecânico",
      "mecanica",
      "mecânica",
      "automotivo",
      "carro",
      "moto",
    ],
    icons: [
      "car",
      "car-front",
      "motorcycle",
      "wrench",
      "gauge",
      "settings",
    ],
  },

  {
    terms: [
      "barbeiro",
      "barbearia",
      "cabeleireiro",
      "cabelo",
      "salao",
      "salão",
      "beleza",
      "estetica",
      "estética",
    ],
    icons: [
      "scissors",
      "sparkles",
      "brush",
      "heart",
      "user",
    ],
  },

  {
    terms: [
      "medico",
      "médico",
      "saude",
      "saúde",
      "enfermeiro",
      "fisioterapia",
      "dentista",
    ],
    icons: [
      "stethoscope",
      "heart-pulse",
      "hospital",
      "cross",
      "pill",
      "activity",
    ],
  },

  {
    terms: [
      "restaurante",
      "comida",
      "cozinha",
      "cozinheiro",
      "chef",
      "lanchonete",
      "pizzaria",
    ],
    icons: [
      "utensils",
      "chef-hat",
      "cooking-pot",
      "pizza",
      "sandwich",
    ],
  },

  {
    terms: [
      "entrega",
      "entregador",
      "delivery",
      "frete",
      "mudanca",
      "mudança",
      "transporte",
    ],
    icons: [
      "truck",
      "motorcycle",
      "bike",
      "package",
      "route",
      "map-pin",
    ],
  },

  {
    terms: [
      "fotografo",
      "fotógrafo",
      "fotografia",
      "video",
      "vídeo",
      "filmagem",
      "evento",
      "eventos",
    ],
    icons: [
      "camera",
      "video",
      "images",
      "clapperboard",
      "party-popper",
    ],
  },
];

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

function humanizeIconName(
  name: string,
) {
  return name
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function validIconNames(
  icons: string[],
) {
  return Array.from(
    new Set(
      icons.filter(
        isValidServiceIconName,
      ),
    ),
  );
}

function getSearchAliases(
  iconName: string,
) {
  const aliases: string[] = [];

  for (const group of SEARCH_GROUPS) {
    if (
      group.icons.includes(
        iconName,
      )
    ) {
      aliases.push(
        ...group.terms,
      );
    }
  }

  return aliases;
}

export function ServiceIconPicker({
  name,
  defaultValue = null,
  label = "Ícone do serviço",
}: ServiceIconPickerProps) {
  const [open, setOpen] =
    useState(false);

  const [selected, setSelected] =
    useState(defaultValue ?? "");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("recommended");

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(
    INITIAL_VISIBLE_ICONS,
  );

  const selectedIsValid =
    isValidServiceIconName(
      selected,
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open]);

  const filteredIcons =
    useMemo(() => {
      const normalizedSearch =
        normalizeText(search);

      /*
       * Quando existe busca,
       * pesquisamos em TODOS os
       * ícones da biblioteca.
       */
      if (normalizedSearch) {
        return SERVICE_ICON_NAMES.filter(
          (iconName) => {
            const aliases =
              getSearchAliases(
                iconName,
              );

            const searchable =
              normalizeText(
                [
                  iconName,
                  humanizeIconName(
                    iconName,
                  ),
                  ...aliases,
                ].join(" "),
              );

            return searchable.includes(
              normalizedSearch,
            );
          },
        );
      }

      const currentCategory =
        ICON_CATEGORIES.find(
          (item) =>
            item.id === category,
        );

      /*
       * Categoria Todos.
       */
      if (
        !currentCategory?.icons
      ) {
        return SERVICE_ICON_NAMES;
      }

      return validIconNames(
        currentCategory.icons,
      ) as ServiceIconName[];
    }, [search, category]);

  const visibleIcons =
    filteredIcons.slice(
      0,
      visibleCount,
    );

  const remaining =
    Math.max(
      filteredIcons.length -
        visibleIcons.length,
      0,
    );

  function selectIcon(
    iconName: ServiceIconName,
  ) {
    setSelected(iconName);
    setOpen(false);
    setSearch("");
  }

  function clearIcon() {
    setSelected("");
  }

  return (
    <div>
      <input
        type="hidden"
        name={name}
        value={selected}
      />

      <p className="text-sm font-medium text-slate-700">
        {label}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <div className="flex min-h-14 min-w-52 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            {selectedIsValid ? (
              <ServiceIcon
                name={selected}
                className="h-5 w-5"
              />
            ) : (
              <span className="text-lg text-slate-400">
                —
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-400">
              Selecionado
            </p>

            <p className="truncate text-sm font-medium text-slate-700">
              {selectedIsValid
                ? humanizeIconName(
                    selected,
                  )
                : "Nenhum ícone"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setOpen(true)
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          Escolher ícone
        </button>

        {selected && (
          <button
            type="button"
            onClick={clearIcon}
            className="px-2 py-3 text-sm font-medium text-slate-400 transition hover:text-red-600"
          >
            Remover
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Escolher ícone do serviço"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4"
        >
          <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* CABEÇALHO */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Escolher ícone
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Todos os ícones
                  disponíveis no Lucide
                  podem ser usados nos
                  serviços.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* BUSCA */}
            <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10">
                <Search
                  size={18}
                  className="shrink-0 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );

                    setVisibleCount(
                      INITIAL_VISIBLE_ICONS,
                    );
                  }}
                  autoFocus
                  placeholder="Buscar: pedreiro, forro, pintura, ar-condicionado, câmera..."
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");

                      setVisibleCount(
                        INITIAL_VISIBLE_ICONS,
                      );
                    }}
                    aria-label="Limpar busca"
                    className="text-slate-400 transition hover:text-slate-700"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              {/* CATEGORIAS */}
              {!search && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {ICON_CATEGORIES.map(
                    (item) => (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() => {
                          setCategory(
                            item.id,
                          );

                          setVisibleCount(
                            INITIAL_VISIBLE_ICONS,
                          );
                        }}
                        className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                          category ===
                          item.id
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        {
                          item.label
                        }
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* ÍCONES */}
            <div className="overflow-y-auto p-4 sm:p-6">
              {visibleIcons.length ===
              0 ? (
                <div className="py-16 text-center">
                  <p className="font-medium text-slate-700">
                    Nenhum ícone
                    encontrado
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Tente outro termo de
                    busca.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                    {visibleIcons.map(
                      (
                        iconName,
                      ) => {
                        const isSelected =
                          selected ===
                          iconName;

                        return (
                          <button
                            key={
                              iconName
                            }
                            type="button"
                            title={humanizeIconName(
                              iconName,
                            )}
                            onClick={() =>
                              selectIcon(
                                iconName,
                              )
                            }
                            className={`group flex aspect-square min-h-20 flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center transition ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-slate-50 hover:text-blue-700"
                            }`}
                          >
                            <ServiceIcon
                              name={
                                iconName
                              }
                              className="h-6 w-6"
                            />

                            <span className="w-full truncate text-[9px] font-medium leading-3 text-slate-500">
                              {humanizeIconName(
                                iconName,
                              )}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>

                  {remaining > 0 && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount(
                            (
                              current,
                            ) =>
                              current +
                              LOAD_MORE_AMOUNT,
                          )
                        }
                        className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                      >
                        Mostrar mais (
                        {remaining}{" "}
                        restantes)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RODAPÉ */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <div>
                <p className="text-xs font-medium text-slate-600">
                  {
                    SERVICE_ICON_NAMES.length
                  }{" "}
                  ícones disponíveis
                </p>

                <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
                  O catálogo acompanha
                  os ícones disponíveis
                  na biblioteca Lucide.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpen(false)
                }
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}