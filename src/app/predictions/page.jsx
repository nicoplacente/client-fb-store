"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconChartLine,
  IconChartPie,
  IconClock,
  IconCircleCheck,
  IconCoins,
  IconHistory,
  IconInfoCircle,
  IconMedal2,
  IconRefresh,
  IconSparkles,
  IconTargetArrow,
  IconTrophy,
  IconUsers,
  IconWallet,
} from "@tabler/icons-react";
import { toast } from "sonner";
import SectionContainer from "@/modules/ui/section-container";
import useAppContext from "@/context/use-app-context";
import { AuthContext } from "@/context/auth-context/auth-context";
import { getMyRanking } from "@/modules/ranking/libs/ranking-api";
import { emitKickPointsUpdated } from "@/modules/ranking/libs/points-events";
import { getErrorMessage } from "@/modules/api/error-message";
import {
  getPredictions,
  normalizePrediction,
  votePrediction,
} from "@/modules/predictions/libs/prediction-api";

const optionAccents = [
  {
    border: "border-blue-400/70",
    softBorder: "border-blue-400/35",
    hoverBorder: "hover:border-blue-400/35",
    text: "text-blue-300",
    bg: "bg-blue-400/10",
    line: "bg-blue-400",
  },
  {
    border: "border-pink-400/70",
    softBorder: "border-pink-400/35",
    hoverBorder: "hover:border-pink-400/35",
    text: "text-pink-300",
    bg: "bg-pink-400/10",
    line: "bg-pink-400",
  },
  {
    border: "border-amber-300/70",
    softBorder: "border-amber-300/35",
    hoverBorder: "hover:border-amber-300/35",
    text: "text-amber-200",
    bg: "bg-amber-300/10",
    line: "bg-amber-300",
  },
  {
    border: "border-green-300/70",
    softBorder: "border-green-300/35",
    hoverBorder: "hover:border-green-300/35",
    text: "text-green-200",
    bg: "bg-green-300/10",
    line: "bg-green-300",
  },
];

function formatNumber(value, options = {}) {
  return new Intl.NumberFormat("es-AR", options).format(Number(value || 0));
}

function formatMultiplier(value) {
  return `x${formatNumber(value, { maximumFractionDigits: 2 })}`;
}

function formatDelta(value) {
  const number = Number(value || 0);
  const sign = number >= 0 ? "+" : "-";

  return `${sign}${formatNumber(Math.abs(number), {
    maximumFractionDigits: 0,
  })} pts`;
}

export default function PredictionsPage() {
  const { user, refreshUser } = useAppContext(AuthContext);
  const [predictions, setPredictions] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [betAmounts, setBetAmounts] = useState({});
  const [historyFilter, setHistoryFilter] = useState("mine");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const normalizedPredictions = useMemo(
    () =>
      predictions
        .map(normalizePrediction)
        .filter((prediction) => prediction.id),
    [predictions],
  );
  const activePredictions = useMemo(
    () =>
      normalizedPredictions.filter(
        (prediction) =>
          prediction.status === "active" &&
          !prediction.resolvedAt &&
          isBettingOpen(prediction, nowMs),
      ),
    [normalizedPredictions, nowMs],
  );
  const waitingPredictions = useMemo(
    () =>
      normalizedPredictions.filter(
        (prediction) =>
          prediction.status === "active" &&
          !prediction.resolvedAt &&
          !isBettingOpen(prediction, nowMs),
      ),
    [normalizedPredictions, nowMs],
  );
  const closedPredictions = useMemo(
    () =>
      normalizedPredictions.filter(
        (prediction) =>
          prediction.status !== "active" || Boolean(prediction.resolvedAt),
      ),
    [normalizedPredictions],
  );
  const latestResolvedPrediction = closedPredictions[0] || null;
  const recentResolvedPrediction =
    latestResolvedPrediction &&
    activePredictions.length === 0 &&
    waitingPredictions.length === 0 &&
    isRecentResolvedPrediction(latestResolvedPrediction, nowMs)
      ? latestResolvedPrediction
      : null;
  const myClosedPredictions = useMemo(
    () =>
      closedPredictions.filter(
        (prediction) => prediction.hasVoted || prediction.currentUserBet,
      ),
    [closedPredictions],
  );
  const visibleHistoryPredictions =
    historyFilter === "mine" ? myClosedPredictions : closedPredictions;

  const loadPredictions = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      const data = await getPredictions();
      setPredictions(data);
    } catch {
      setError("No se pudieron cargar las predicciones");
      setPredictions([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const loadAvailablePoints = useCallback(async () => {
    if (!user?.id) {
      setAvailablePoints(0);
      return 0;
    }

    try {
      const ranking = await getMyRanking();
      const points = Number(ranking.points || 0);

      setAvailablePoints(points);
      return points;
    } catch {
      setAvailablePoints(0);
      return 0;
    }
  }, [user?.id]);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  useEffect(() => {
    loadAvailablePoints();
  }, [loadAvailablePoints]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  function handleVote(prediction) {
    const optionId = selectedOptions[prediction.id];
    const points = Math.floor(Number(betAmounts[prediction.id] || 0));

    if (!user) {
      toast.error("Inicia sesion para votar");
      return;
    }

    if (!optionId) {
      toast.error("Elegí una opcion");
      return;
    }

    if (!Number.isFinite(points) || points < 1) {
      toast.error("Ingresa al menos 1 punto");
      return;
    }

    if (points < Number(prediction.minBetPoints || 1)) {
      toast.error(`La apuesta minima es de ${prediction.minBetPoints} puntos`);
      return;
    }

    if (prediction.maxBetPoints && points > Number(prediction.maxBetPoints)) {
      toast.error(`La apuesta maxima es de ${prediction.maxBetPoints} puntos`);
      return;
    }

    startTransition(async () => {
      try {
        const result = await votePrediction(prediction.id, {
          optionId,
          points,
        });

        setPredictions((current) =>
          current.map((item) =>
            Number(item.id) === Number(prediction.id)
              ? result.prediction
              : item,
          ),
        );
        const nextPoints = Math.max(0, availablePoints - points);
        setAvailablePoints(nextPoints);
        emitKickPointsUpdated(nextPoints);
        await Promise.resolve(refreshUser?.()).catch(() => {});
        toast.success("Prediccion registrada");
      } catch (err) {
        toast.error(getErrorMessage(err, "No se pudo votar"));
        await loadAvailablePoints();
      }
    });
  }

  return (
    <SectionContainer className="space-y-8">
      <PredictionsHero
        activeCount={activePredictions.length}
        totalPool={normalizedPredictions.reduce(
          (sum, prediction) => sum + Number(prediction.totalPool || 0),
          0,
        )}
        availablePoints={availablePoints}
        onRefresh={() => loadPredictions({ showLoading: false })}
      />

      {loading ? (
        <StatePanel text="Cargando predicciones..." />
      ) : error ? (
        <StatePanel text={error} tone="error" />
      ) : activePredictions.length === 0 && waitingPredictions.length === 0 ? (
        <StatePanel text="Esperando la próxima predicción" />
      ) : activePredictions.length === 0 ? (
        <div className="grid gap-5">
          {waitingPredictions.map((prediction) => (
            <WaitingResultPredictionCard
              key={prediction.id}
              prediction={prediction}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-5">
          {activePredictions.map((prediction) => (
            <PredictionCard
              key={prediction.id}
              prediction={prediction}
              selectedOptionId={selectedOptions[prediction.id]}
              betAmount={betAmounts[prediction.id] || ""}
              availablePoints={availablePoints}
              isPending={isPending}
              onBetChange={(value) =>
                setBetAmounts((current) => ({
                  ...current,
                  [prediction.id]: value,
                }))
              }
              onOptionChange={(optionId) =>
                setSelectedOptions((current) => ({
                  ...current,
                  [prediction.id]: optionId,
                }))
              }
              onVote={() => handleVote(prediction)}
            />
          ))}
        </div>
      )}

      {closedPredictions.length ? (
        <>
          {recentResolvedPrediction ? (
            <ResolvedPredictionCard prediction={recentResolvedPrediction} />
          ) : null}
          <PredictionHistory
            activeFilter={historyFilter}
            allCount={closedPredictions.length}
            myCount={myClosedPredictions.length}
            predictions={visibleHistoryPredictions}
            onFilterChange={setHistoryFilter}
          />
        </>
      ) : null}
    </SectionContainer>
  );
}

function PredictionsHero({
  activeCount,
  totalPool,
  availablePoints,
  onRefresh,
}) {
  const stats = [
    {
      label: "En vivo",
      value: formatNumber(activeCount),
      detail: activeCount === 1 ? "prediccion activa" : "predicciones activas",
      icon: IconTargetArrow,
    },
    {
      label: "Pool abierto",
      value: `${formatNumber(totalPool)} pts`,
      detail: "puntos en juego",
      icon: IconCoins,
    },
    {
      label: "Tu saldo",
      value: `${formatNumber(availablePoints)} pts`,
      detail: "disponibles para apostar",
      icon: IconWallet,
    },
  ];
  const steps = [
    ["Elegí", "Lee el contexto y marca una opcion."],
    ["Apostá", "Define puntos dentro de los limites."],
    ["Cobra", "Si aciertas, recibis el multiplicador."],
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_16%_0%,rgba(239,68,68,0.34),transparent_34%),linear-gradient(135deg,rgba(24,24,27,0.92),rgba(10,10,10,0.96)_46%,rgba(127,29,29,0.3))] p-4 shadow-2xl shadow-black/35 ring-1 ring-white/[0.04] sm:p-6">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-red-200/60 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-56 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-red-300/25 bg-red-500/10 px-3 text-xs font-black uppercase tracking-wide text-red-100">
            <span className="size-2 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.85)]" />
            Arena del stream
          </span>
          <h1 className="mt-4 flex items-center gap-3 text-3xl font-black leading-tight text-white sm:text-5xl">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-red-100 shadow-xl shadow-black/25">
              <IconChartPie size={24} />
            </span>
            Predicciones
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-300 sm:text-base">
            Anticipá lo que pasa en vivo, medí el riesgo antes de confirmar y
            competí por puntos sin perder de vista el cierre de cada jugada.
          </p>
        </div>

        <button
          type="button"
          aria-label="Actualizar predicciones"
          onClick={onRefresh}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-neutral-950/70 px-4 py-2 text-xs font-black uppercase tracking-wide text-neutral-300 transition hover:-translate-y-0.5 hover:border-red-300/35 hover:bg-red-500/10 hover:text-white focus:outline-none"
        >
          <IconRefresh size={16} />
          Actualizar
        </button>
      </div>

      <div className="relative mt-6 grid gap-3 md:grid-cols-3">
        {stats.map((stat) => (
          <HeroStat key={stat.label} {...stat} />
        ))}
      </div>

      <div className="relative mt-4 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-2 md:grid-cols-3">
        {steps.map(([label, text], index) => (
          <HeroGuideStep
            key={label}
            index={index + 1}
            label={label}
            text={text}
          />
        ))}
      </div>
    </section>
  );
}

function HeroStat({ label, value, detail, icon: Icon }) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-neutral-950/55 p-4 transition hover:-translate-y-0.5 hover:border-red-300/25 hover:bg-neutral-900/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-neutral-500">
            {label}
          </p>
          <strong className="mt-2 block font-mono text-2xl font-black text-white">
            {value}
          </strong>
        </div>
        <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-red-200 transition group-hover:border-red-300/30 group-hover:bg-red-500/10">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {detail}
      </p>
    </div>
  );
}

function HeroGuideStep({ index, label, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-red-300/25 bg-red-500/10 font-mono text-xs font-black text-red-100">
        {index}
      </span>
      <div>
        <p className="text-sm font-black text-white">{label}</p>
        <p className="text-xs text-neutral-500">{text}</p>
      </div>
    </div>
  );
}

function PredictionCard({
  prediction,
  selectedOptionId,
  betAmount,
  availablePoints,
  isPending,
  onOptionChange,
  onBetChange,
  onVote,
}) {
  const selectedOption = prediction.options.find(
    (option) => Number(option.id) === Number(selectedOptionId),
  );
  const betPoints = Math.floor(Number(betAmount || 0));
  const bettingClosed = prediction.endsAt
    ? getRemainingMs(prediction.endsAt) <= 0
    : false;
  const availableBetPoints = Math.max(
    0,
    Math.floor(Number(availablePoints || 0)),
  );
  const rawPredictionMaxBetPoints = Number(prediction.maxBetPoints);
  const predictionMaxBetPoints =
    Number.isFinite(rawPredictionMaxBetPoints) && rawPredictionMaxBetPoints > 0
      ? Math.floor(rawPredictionMaxBetPoints)
      : availableBetPoints;
  const maxBetAmount = Math.max(
    0,
    Math.min(availableBetPoints, predictionMaxBetPoints),
  );
  const possiblePayout = selectedOption
    ? betPoints * Number(prediction.payoutMultiplier || 2)
    : 0;
  const maxBetDisabled =
    prediction.hasVoted || bettingClosed || isPending || maxBetAmount < 1;

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(23,23,23,0.92),rgba(10,10,10,0.92))] p-4 shadow-2xl shadow-black/30 ring-1 ring-white/[0.03] transition hover:border-red-300/20 sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-amber-300 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-16 size-52 rounded-full bg-red-500/8 blur-3xl transition group-hover:bg-red-500/12" />

      <div className="relative space-y-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-green-300">
              <span className="size-2 animate-pulse rounded-full bg-green-400" />
              Prediccion activa
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-neutral-300">
              <IconClock size={15} />
              <CountdownTimer endsAt={prediction.endsAt} />
            </div>
          </div>
          <h2 className="mt-3 text-2xl font-black leading-tight text-white sm:text-3xl">
            {prediction.title}
          </h2>
          {prediction.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
              {prediction.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <PredictionSummaryPill
            icon={IconCoins}
            label="Pool"
            value={`${formatNumber(prediction.totalPool)} pts`}
          />
          <PredictionSummaryPill
            icon={IconUsers}
            label="Jugadores"
            value={formatNumber(prediction.players)}
          />
          <PredictionSummaryPill
            icon={IconArrowUpRight}
            label="Pago"
            value={formatMultiplier(prediction.payoutMultiplier)}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-stretch">
          <div className="h-full rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-wide text-neutral-500">
              <span className="inline-flex items-center gap-2">
                <IconChartLine size={15} />
                Pool por opcion
              </span>
              <span className="rounded-full border border-green-300/20 bg-green-400/10 px-2.5 py-1 text-green-200">
                {formatMultiplier(prediction.payoutMultiplier)}
              </span>
            </div>
            <div className="grid gap-3">
              {prediction.options.map((option, index) => (
                <PredictionOption
                  key={option.id}
                  option={option}
                  accent={optionAccents[index % optionAccents.length]}
                  selected={Number(selectedOptionId) === Number(option.id)}
                  locked={prediction.hasVoted}
                  onSelect={() => onOptionChange(option.id)}
                />
              ))}
            </div>
          </div>

          <aside className="flex h-full flex-col rounded-2xl border border-white/10 bg-neutral-950/75 p-4 shadow-inner shadow-black/20">
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={`prediction-bet-${prediction.id}`}
                  className="text-sm font-semibold text-neutral-300"
                >
                  Puntos a apostar
                </label>
                <button
                  type="button"
                  onClick={() => onBetChange(String(maxBetAmount))}
                  disabled={maxBetDisabled}
                  className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-lg border border-red-300/25 bg-red-500/10 px-3 text-[11px] font-black uppercase tracking-wide text-red-100 transition hover:border-red-200/45 hover:bg-red-500/20 focus:outline-none  disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-900 disabled:text-neutral-600"
                >
                  Max
                </button>
              </div>
              <input
                id={`prediction-bet-${prediction.id}`}
                type="number"
                min={prediction.minBetPoints}
                max={prediction.maxBetPoints || availableBetPoints}
                value={betAmount}
                onChange={(event) => onBetChange(event.target.value)}
                disabled={prediction.hasVoted || bettingClosed}
                className="min-h-12 rounded-xl border border-white/10 bg-neutral-950 px-3 py-2.5 font-mono text-white shadow-inner shadow-black/10 outline-none transition placeholder:text-neutral-600 hover:border-red-300/25 focus:border-red-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="100"
              />
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-sm">
              <p className="mb-2 flex items-center justify-between gap-3 text-neutral-500">
                Limites
                <span className="font-black text-neutral-200">
                  {formatNumber(prediction.minBetPoints)} -{" "}
                  {prediction.maxBetPoints
                    ? formatNumber(prediction.maxBetPoints)
                    : "sin max."}{" "}
                  pts
                </span>
              </p>
              <p className="flex items-center justify-between gap-3 text-neutral-500">
                Si ganas
                <span className="font-black text-green-300">
                  +{formatNumber(possiblePayout)} pts
                </span>
              </p>
              <p className="mt-2 flex items-center justify-between gap-3 text-neutral-500">
                Si perdes
                <span className="font-black text-red-300">
                  -{formatNumber(betPoints)} pts
                </span>
              </p>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-neutral-900/45 p-3 text-xs leading-5 text-neutral-400">
              <p className="flex items-start gap-2">
                <IconInfoCircle
                  className="mt-0.5 shrink-0 text-red-200"
                  size={16}
                />
                {selectedOption
                  ? `Vas con ${selectedOption.label}. Revisa el cierre antes de confirmar.`
                  : "Selecciona una opcion para calcular el pago estimado."}
              </p>
            </div>

            <button
              type="button"
              onClick={onVote}
              disabled={isPending || prediction.hasVoted || bettingClosed}
              className="mt-auto inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-gradient-to-r from-red-700 to-red-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_rgba(255,45,45,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(255,45,45,0.30)] focus:outline-none disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-neutral-900 disabled:bg-none disabled:text-neutral-500 disabled:shadow-none"
            >
              {prediction.hasVoted ? (
                <IconCircleCheck size={18} />
              ) : (
                <IconTrophy size={18} />
              )}
              {prediction.hasVoted
                ? "Tu voto esta registrado"
                : bettingClosed
                  ? "Apuestas cerradas"
                  : "Confirmar prediccion"}
            </button>
          </aside>
        </div>
      </div>
    </article>
  );
}

function PredictionSummaryPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-950/55 p-3">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-neutral-500">
        <Icon size={15} />
        {label}
      </p>
      <strong className="mt-2 block font-mono text-lg font-black text-white">
        {value}
      </strong>
    </div>
  );
}

function WaitingResultPredictionCard({ prediction }) {
  const bet = prediction.currentUserBet;
  const selectedOption = prediction.options.find(
    (option) => Number(option.id) === Number(bet?.optionId),
  );
  const betPoints = Number(bet?.points || 0);
  const possiblePayout = betPoints * Number(prediction.payoutMultiplier || 2);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-amber-300/18 bg-[linear-gradient(180deg,rgba(23,23,23,0.92),rgba(10,10,10,0.92))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-300 via-amber-400 to-transparent" />
      <div className="pointer-events-none absolute -right-20 top-10 size-48 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-green-300">
          <span className="size-2 rounded-full bg-green-400" />
          Prediccion cerrada
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-200">
          <span className="size-2 animate-pulse rounded-full bg-amber-300" />
          Esperando ganador
        </div>
      </div>

      <h2 className="relative mt-4 text-2xl font-black leading-tight text-white sm:text-4xl">
        {prediction.title}
      </h2>
      <p className="relative mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
        Las apuestas ya cerraron. El resultado se acredita cuando el admin
        define la opcion ganadora.
      </p>

      <div className="relative mt-5 grid overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/60 sm:grid-cols-4">
        <WaitingStat
          label="Pool"
          value={`${formatNumber(prediction.totalPool)} pts`}
        />
        <WaitingStat
          label="Jugadores"
          value={formatNumber(prediction.players)}
        />
        <WaitingStat
          label="Tu jugada"
          value={betPoints ? `${formatNumber(betPoints)} pts` : "Sin apuesta"}
        />
        <WaitingStat
          label="Si ganas"
          value={betPoints ? `+${formatNumber(possiblePayout)} pts` : "-"}
        />
      </div>

      <div className="relative mt-5 grid gap-3 md:grid-cols-2">
        {prediction.options.map((option, index) => (
          <WaitingOptionCard
            key={option.id}
            option={option}
            accent={optionAccents[index % optionAccents.length]}
            selected={Number(selectedOption?.id) === Number(option.id)}
          />
        ))}
      </div>

      <div className="relative mt-5 flex flex-col gap-3 rounded-2xl border border-amber-300/35 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2 font-black uppercase tracking-wide">
          <IconClock size={17} />
          Ticket en revision
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-200/80">
          {selectedOption
            ? `Tu opcion: ${selectedOption.label}`
            : "Sin apuesta registrada"}
        </span>
      </div>
    </article>
  );
}

function WaitingStat({ label, value }) {
  return (
    <div className="border-b border-white/10 p-4 transition hover:bg-white/[0.03] sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-[10px] font-black uppercase tracking-wide text-neutral-600">
        {label}
      </p>
      <strong className="mt-1 block font-mono text-lg font-black text-white">
        {value}
      </strong>
    </div>
  );
}

function WaitingOptionCard({ option, accent, selected }) {
  return (
    <div
      className={`rounded-2xl border bg-neutral-950/55 p-4 transition ${
        selected ? `${accent.border} ${accent.bg}` : accent.softBorder
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{option.label}</p>
          <p className={`mt-3 font-mono text-5xl text-current ${accent.text}`}>
            {formatNumber(option.percent)}
            <span className="ml-1 text-base">%</span>
          </p>
        </div>
        {selected ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase ${accent.softBorder} ${accent.text}`}
          >
            <IconCircleCheck size={13} />
            Tu eleccion
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {formatNumber(option.totalPoints)} pts · {formatNumber(option.players)}{" "}
        jugadores
      </p>
    </div>
  );
}

function getRemainingMs(value) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return 0;

  return date.getTime() - Date.now();
}

function isBettingOpen(prediction, now = Date.now()) {
  if (!prediction.endsAt) return true;

  const date = new Date(prediction.endsAt);

  if (!Number.isFinite(date.getTime())) return true;

  return date.getTime() > now;
}

function isRecentResolvedPrediction(prediction, now = Date.now()) {
  if (!prediction.resolvedAt) return false;

  const date = new Date(prediction.resolvedAt);

  if (!Number.isFinite(date.getTime())) return false;

  return now - date.getTime() <= 120000;
}

function CountdownTimer({ endsAt }) {
  const [remainingMs, setRemainingMs] = useState(() =>
    endsAt ? getRemainingMs(endsAt) : null,
  );

  useEffect(() => {
    if (!endsAt) return undefined;

    const intervalId = window.setInterval(() => {
      setRemainingMs(getRemainingMs(endsAt));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [endsAt]);

  if (!endsAt) return "Manual";

  const safeRemaining = Math.max(0, Number(remainingMs || 0));
  const minutes = Math.floor(safeRemaining / 60000);
  const seconds = Math.floor((safeRemaining % 60000) / 1000);

  if (safeRemaining <= 0) return "Cerrada";

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function PredictionOption({ option, accent, selected, locked, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      className={`group/option cursor-pointer rounded-2xl border bg-neutral-950/55 p-4 text-left transition hover:-translate-y-0.5 hover:bg-neutral-900/70 focus:outline-none disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
        selected || option.isUserChoice
          ? `${accent.border} ${accent.bg}`
          : `border-white/10 ${accent.hoverBorder}`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-black text-white">{option.label}</p>
          <p className="mt-2 font-mono text-4xl font-black text-white">
            {formatNumber(option.percent)}
            <span className={`ml-1 text-base ${accent.text}`}>%</span>
          </p>
        </div>
        {(selected || option.isUserChoice) && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-black uppercase ${accent.softBorder} ${accent.text}`}
          >
            <IconCircleCheck size={13} />
            Tu eleccion
          </span>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${accent.line} shadow-[0_0_18px_currentColor] transition-all duration-300 ${getPercentWidthClass(
            option.percent,
          )}`}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        <span>{formatNumber(option.totalPoints)} pts</span>
        <span>{formatNumber(option.players)} jugadores</span>
      </div>
    </button>
  );
}

const percentWidthClasses = {
  0: "w-0",
  5: "w-[5%]",
  10: "w-[10%]",
  15: "w-[15%]",
  20: "w-[20%]",
  25: "w-1/4",
  30: "w-[30%]",
  35: "w-[35%]",
  40: "w-[40%]",
  45: "w-[45%]",
  50: "w-1/2",
  55: "w-[55%]",
  60: "w-[60%]",
  65: "w-[65%]",
  70: "w-[70%]",
  75: "w-3/4",
  80: "w-4/5",
  85: "w-[85%]",
  90: "w-[90%]",
  95: "w-[95%]",
  100: "w-full",
};

function getPercentWidthClass(percent) {
  const safePercent = Math.min(100, Math.max(0, Number(percent || 0)));
  const bucket = Math.round(safePercent / 5) * 5;

  return percentWidthClasses[bucket] || "w-0";
}

function ResolvedPredictionCard({ prediction }) {
  const outcome = getPredictionOutcome(prediction);

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(23,23,23,0.92),rgba(10,10,10,0.92))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green-300/45 to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-wide text-green-300">
          <span className="size-2 rounded-full bg-green-400" />
          Ultimo resultado
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-neutral-400">
          <span className="size-2 rounded-full bg-neutral-500" />
          Resuelta
        </div>
      </div>

      <h2 className="mt-4 text-lg font-black leading-tight text-white sm:text-2xl">
        {prediction.title}
      </h2>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {prediction.options.map((option, index) => (
          <ResolvedOptionCard
            key={option.id}
            option={option}
            accent={optionAccents[index % optionAccents.length]}
            winner={Number(option.id) === Number(prediction.winningOptionId)}
          />
        ))}
      </div>

      <ResolvedOutcomePanel prediction={prediction} outcome={outcome} />
    </article>
  );
}

function ResolvedOptionCard({ option, accent, winner }) {
  const classes = winner
    ? "border-green-400/70 bg-green-500/10 text-green-300 shadow-[0_16px_38px_rgba(34,197,94,0.12)]"
    : `${accent.softBorder} bg-neutral-950/55 ${accent.text}`;

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-white">{option.label}</p>
          <p className="mt-3 font-mono text-3xl text-current">
            {formatNumber(option.percent)}
            <span className="ml-1 text-base">%</span>
          </p>
        </div>
        {winner ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-300/40 bg-green-400/10 px-3 py-1 text-[10px] font-black uppercase text-green-200">
            <IconMedal2 size={13} />
            Ganadora
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {formatNumber(option.totalPoints)} pts · {formatNumber(option.players)}{" "}
        jugadores
      </p>
    </div>
  );
}

function ResolvedOutcomePanel({ prediction, outcome }) {
  const won = outcome.status === "won";
  const lost = outcome.status === "lost";
  const panelClasses = won
    ? "border-green-400/35 bg-green-500/10 text-green-300"
    : lost
      ? "border-red-400/35 bg-red-500/10 text-red-300"
      : "border-white/10 bg-neutral-900/55 text-neutral-300";

  return (
    <div
      className={`mt-5 rounded-2xl border p-5 text-center shadow-inner shadow-black/15 ${panelClasses}`}
    >
      <p className="inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide">
        {won ? (
          <IconTrophy size={16} />
        ) : lost ? (
          <IconAlertTriangle size={16} />
        ) : (
          <IconInfoCircle size={16} />
        )}
        {won ? "Acertaste" : lost ? "Fallaste" : "Resultado"}
      </p>
      <p className="mt-3 font-mono text-xl font-black sm:text-3xl">
        {outcome.status === "none"
          ? prediction.winningOption?.label || "Pendiente"
          : formatDelta(outcome.delta)}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {won
          ? `Gano · ${prediction.winningOption?.label || "Ganador"}`
          : lost
            ? `Perdiste · ${formatNumber(outcome.betPoints)} pts`
            : `Ganador · ${prediction.winningOption?.label || "Pendiente"}`}
      </p>
    </div>
  );
}

function PredictionHistory({
  activeFilter,
  allCount,
  myCount,
  predictions,
  onFilterChange,
}) {
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-neutral-950/45 p-4 shadow-2xl shadow-black/20 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-green-300">
            <IconHistory size={18} />
            Historial
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Resultados anteriores
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Revisá tus balances y las rondas cerradas del stream.
          </p>
        </div>
        <div className="flex gap-2">
          <HistoryFilterButton
            active={activeFilter === "mine"}
            label="Mis predicciones"
            count={myCount}
            onClick={() => onFilterChange("mine")}
          />
          <HistoryFilterButton
            active={activeFilter === "all"}
            label="Todas"
            count={allCount}
            onClick={() => onFilterChange("all")}
          />
        </div>
      </div>

      {predictions.length ? (
        <div className="grid gap-2">
          {predictions.map((prediction) => (
            <HistoryRow key={prediction.id} prediction={prediction} />
          ))}
        </div>
      ) : (
        <StatePanel text="Todavia no tenes predicciones resueltas." />
      )}
    </section>
  );
}

function HistoryFilterButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wide transition focus:outline-none ${
        active
          ? "border-red-300/30 bg-red-500/10 text-white"
          : "border-white/10 bg-neutral-950/70 text-neutral-500 hover:border-red-300/25 hover:text-white"
      }`}
    >
      {label}{" "}
      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-neutral-400">
        {count}
      </span>
    </button>
  );
}

function HistoryRow({ prediction }) {
  const outcome = getPredictionOutcome(prediction);
  const won = outcome.status === "won";
  const lost = outcome.status === "lost";
  const badgeClasses = won
    ? "border-green-300/35 bg-green-400/10 text-green-300"
    : lost
      ? "border-red-300/35 bg-red-400/10 text-red-300"
      : "border-white/10 bg-neutral-900 text-neutral-400";

  return (
    <article className="grid gap-3 rounded-2xl border border-white/10 bg-neutral-950/70 px-4 py-3 shadow-xl shadow-black/10 transition hover:border-red-300/20 hover:bg-neutral-900/70 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <h3 className="truncate text-base font-black text-white">
          {prediction.title}
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-neutral-600">
          <span className="text-blue-300">
            {prediction.winningOption?.label || "Pendiente"}
          </span>
          <span>
            {formatNumber(outcome.betPoints || prediction.totalPool)} pts
          </span>
          <span>
            {getRelativeTime(prediction.resolvedAt || prediction.endsAt)}
          </span>
        </p>
      </div>
      <span
        className={`inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border px-3 py-1 text-xs font-black uppercase ${badgeClasses}`}
      >
        {outcome.status === "none" ? "Resuelta" : formatDelta(outcome.delta)}
      </span>
    </article>
  );
}

function getPredictionOutcome(prediction) {
  const bet = prediction.currentUserBet;

  if (!bet) {
    return {
      status: "none",
      delta: 0,
      betPoints: 0,
    };
  }

  if (bet.status === "won") {
    return {
      status: "won",
      delta: Number(bet.payout || 0),
      betPoints: Number(bet.points || 0),
    };
  }

  if (bet.status === "lost") {
    return {
      status: "lost",
      delta: -Number(bet.points || 0),
      betPoints: Number(bet.points || 0),
    };
  }

  const won = Number(bet.optionId) === Number(prediction.winningOptionId);

  return {
    status: won ? "won" : "lost",
    delta: won
      ? Number(bet.payout || bet.points * prediction.payoutMultiplier || 0)
      : -Number(bet.points || 0),
    betPoints: Number(bet.points || 0),
  };
}

function getRelativeTime(value) {
  if (!value) return "hace un momento";

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return "hace un momento";

  const minutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );

  if (minutes < 60) return `hace ${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `hace ${hours}h`;

  return `hace ${Math.floor(hours / 24)}d`;
}

function StatePanel({ text, tone = "default" }) {
  const classes =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-white/10 bg-neutral-950/70 text-neutral-400";
  const Icon = tone === "error" ? IconAlertTriangle : IconSparkles;

  return (
    <div
      className={`rounded-3xl border p-10 text-center shadow-xl shadow-black/15 ${classes}`}
    >
      <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
        <Icon size={22} />
      </span>
      <p className="mt-4 text-sm font-black uppercase tracking-wide">{text}</p>
    </div>
  );
}
