"use client";

import SectionContainer from "@/modules/ui/section-container";
import ConfirmationDialog from "@/modules/ui/confirmation-dialog";
import {
  CreditPackagesPanel,
  GiveawaysPanel,
  ProductsPanel,
} from "@/modules/dashboard/components/catalog-panels";
import StatCard from "@/modules/dashboard/components/stat-card";
import StreamDangerPanel from "@/modules/dashboard/components/stream-danger-panel";
import StreamPanel from "@/modules/dashboard/components/stream-panel";
import RewardWheelPanel from "@/modules/dashboard/components/reward-wheel-panel";
import KickModerationPanel from "@/modules/dashboard/components/kick-moderation-panel";
import {
  RedemptionsPanel,
  SupportPanel,
} from "@/modules/dashboard/components/ticket-panels";
import useDashboardController from "@/modules/dashboard/hooks/use-dashboard-controller";
import { dashboardTabs } from "@/modules/dashboard/lib/constants";

export default function DashboardPage() {
  const dashboard = useDashboardController();

  if (!dashboard.user) {
    return (
      <DashboardMessage
        title="Dashboard"
        text="Inicia sesion para acceder al panel de gestion."
      />
    );
  }

  if (!dashboard.canManageDashboard) {
    return (
      <DashboardMessage
        eyebrow="Acceso restringido"
        title="Dashboard"
        text="Solo mods, admins y el streamer principal pueden administrar la tienda."
      />
    );
  }

  return (
    <SectionContainer className="space-y-8">
      <DashboardHeader
        loading={dashboard.loading}
        isPending={dashboard.isPending}
        onRefresh={dashboard.loadDashboard}
      />
      <DashboardStats stats={dashboard.stats} />
      <DashboardTabs
        activeTab={dashboard.activeTab}
        onChange={dashboard.setActiveTab}
      />

      {dashboard.error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200 shadow-xl shadow-black/15">
          {dashboard.error}
        </div>
      ) : null}

      <DashboardActivePanel dashboard={dashboard} />
      <DashboardConfirmationDialog dashboard={dashboard} />
    </SectionContainer>
  );
}

function DashboardMessage({ eyebrow, title, text }) {
  return (
    <SectionContainer className="space-y-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.14),rgba(10,10,10,0.88)_42%,rgba(10,10,10,0.96))] p-6 text-center shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-8">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={
            eyebrow
              ? "mt-2 text-2xl font-bold text-white sm:text-3xl"
              : "text-2xl font-bold text-white sm:text-3xl"
          }
        >
          {title}
        </h1>
        <p className="mt-3 text-neutral-400">{text}</p>
      </div>
    </SectionContainer>
  );
}

function DashboardHeader({ loading, isPending, onRefresh }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(220,38,38,0.16),rgba(10,10,10,0.74)_38%,rgba(10,10,10,0.9))] p-4 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] sm:p-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-red-200/45 to-transparent" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-red-300/80">
            Administracion
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-neutral-400">
            Gestiona catalogo, sorteos, canjes, consultas y herramientas del
            stream desde un solo panel.
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard label="Productos" value={stats.products} />
      <StatCard label="Packs de creditos" value={stats.credits} />
      <StatCard label="Sorteos" value={stats.giveaways} />
      <StatCard label="Compras pendientes" value={stats.purchases} />
      <StatCard label="Tickets abiertos" value={stats.tickets} />
    </div>
  );
}

function DashboardTabs({ activeTab, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Secciones del dashboard"
      className="grid grid-cols-3 gap-2 rounded-2xl p-2 lg:flex lg:gap-2"
    >
      {dashboardTabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-16 grow cursor-pointer flex-col shadow-xl shadow-black/20 items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs font-bold transition focus:outline-none lg:min-h-0 lg:flex-row lg:gap-2 lg:px-4 lg:py-3 lg:text-sm ${
              active
                ? "border-red-300/45 bg-red-500/15 text-white shadow-lg shadow-red-950/20"
                : "border-white/10 bg-neutral-900/55 text-neutral-500 hover:-translate-y-0.5 hover:border-red-300/25 hover:bg-white/[0.04] hover:text-neutral-200"
            }`}
          >
            <Icon size={19} />
            <span className="max-w-full truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function DashboardActivePanel({ dashboard }) {
  if (!dashboard.activeTabReady) {
    return null;
  }

  if (dashboard.activeTab === "products") {
    return (
      <ProductsPanel
        form={dashboard.productForm}
        items={dashboard.products}
        loading={dashboard.loading}
        isPending={dashboard.isPending}
        selectedId={dashboard.selectedProductId}
        isFormOpen={dashboard.productModalOpen}
        onCreate={dashboard.createProductForm}
        onSubmit={dashboard.submitProduct}
        onCancel={dashboard.resetProductForm}
        onEdit={dashboard.editProduct}
        onDelete={dashboard.removeProduct}
      />
    );
  }

  if (dashboard.activeTab === "credits") {
    return (
      <CreditPackagesPanel
        form={dashboard.creditPackageForm}
        setForm={dashboard.setCreditPackageForm}
        items={dashboard.creditPackages}
        loading={dashboard.loading}
        isPending={dashboard.isPending}
        selectedId={dashboard.selectedCreditPackageId}
        isFormOpen={dashboard.creditPackageModalOpen}
        onCreate={dashboard.createCreditPackageForm}
        onSubmit={dashboard.submitCreditPackage}
        onCancel={dashboard.resetCreditPackageForm}
        onEdit={dashboard.editCreditPackage}
        onDelete={dashboard.removeCreditPackage}
      />
    );
  }

  if (dashboard.activeTab === "giveaways") {
    return (
      <GiveawaysPanel
        form={dashboard.giveawayForm}
        items={dashboard.giveaways}
        loading={dashboard.loading}
        isPending={dashboard.isPending}
        selectedId={dashboard.selectedGiveawayId}
        isFormOpen={dashboard.giveawayModalOpen}
        onCreate={dashboard.createGiveawayForm}
        onSubmit={dashboard.submitGiveaway}
        onCancel={dashboard.resetGiveawayForm}
        onEdit={dashboard.editGiveaway}
        onDelete={dashboard.removeGiveaway}
      />
    );
  }

  const ticketProps = {
    replies: dashboard.supportReplies,
    setReplies: dashboard.setSupportReplies,
    loading: dashboard.loading,
    isPending: dashboard.isPending,
    onStatusChange: dashboard.updateTicketStatus,
    onReply: dashboard.replyToTicket,
    onDelete: dashboard.removeTicket,
  };

  if (dashboard.activeTab === "support") {
    return (
      <SupportPanel
        tickets={dashboard.supportTickets}
        onDeleteAll={dashboard.removeAllSupportTickets}
        onDeleteClosed={dashboard.removeClosedSupportTickets}
        {...ticketProps}
      />
    );
  }

  if (dashboard.activeTab === "redemptions") {
    return (
      <RedemptionsPanel
        tickets={dashboard.redemptionTickets}
        products={dashboard.products}
        onDeleteAll={dashboard.removeAllRedemptions}
        onDeleteClosed={dashboard.removeClosedRedemptions}
        onApproveAudio={dashboard.approveAudioRedemption}
        onRejectAudio={dashboard.rejectAudioRedemption}
        {...ticketProps}
      />
    );
  }

  if (dashboard.activeTab === "stream") {
    return (
      <div className="space-y-6">
        <StreamPanel
          streamHour={dashboard.streamHour}
          streamRewards={dashboard.streamRewards}
          loading={dashboard.loading}
          isPending={dashboard.isPending}
          onActivateHour={dashboard.activateStreamHour}
          onActivateChest={dashboard.activateStreamChest}
          onActivateChatReward={dashboard.activateStreamChatReward}
          onCreatePrediction={dashboard.submitStreamPrediction}
          onResolvePrediction={dashboard.resolveStreamPrediction}
          onDisableHour={dashboard.disableStreamHour}
          predictions={dashboard.predictions}
        />
        <RewardWheelPanel
          rewardWheels={dashboard.rewardWheels}
          selectedWheelId={dashboard.rewardWheel.id}
          prizes={dashboard.rewardWheel.prizes}
          hasUnsavedChanges={dashboard.rewardWheelDirty}
          isPending={dashboard.isPending}
          onAddPrize={dashboard.addRewardWheelPrize}
          onChangePrize={dashboard.updateRewardWheelPrize}
          onRemovePrize={dashboard.removeRewardWheelPrize}
          onSelectWheel={dashboard.selectRewardWheel}
          onSave={dashboard.saveRewardWheel}
        />
        {dashboard.canManageKickModeration ? (
          <KickModerationPanel
            moderation={dashboard.kickModeration}
            isPending={dashboard.isPending}
            onConnect={dashboard.connectKickModeration}
            onDisconnect={dashboard.disconnectKickModeration}
          />
        ) : null}
      </div>
    );
  }

  if (dashboard.activeTab === "danger") {
    return (
      <StreamDangerPanel
        isPending={dashboard.isPending}
        liveStatus={dashboard.liveStatus}
        streamHour={dashboard.streamHour}
        onRemovePredictionsHistory={dashboard.removePredictionsHistory}
        onResetRankingPoints={dashboard.resetRankingPointsToZero}
      />
    );
  }

  return null;
}

function DashboardConfirmationDialog({ dashboard }) {
  const confirmation = dashboard.confirmation;

  return (
    <ConfirmationDialog
      open={Boolean(confirmation)}
      variant="danger"
      title={confirmation?.title}
      description={confirmation?.description}
      confirmLabel={
        dashboard.isPending ? "Procesando..." : confirmation?.confirmLabel
      }
      cancelLabel={confirmation?.cancelLabel}
      confirmDisabled={dashboard.isPending}
      onCancel={dashboard.cancelConfirmation}
      onConfirm={dashboard.confirmDashboardAction}
    >
      {confirmation?.details?.length ? (
        <div className="space-y-3 text-sm leading-6 text-neutral-300">
          <p className="font-semibold text-red-100">
            Antes de confirmar, revisa el alcance:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-neutral-400">
            {confirmation.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </ConfirmationDialog>
  );
}
