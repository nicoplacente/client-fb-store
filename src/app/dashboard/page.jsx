"use client";

import { IconRefresh } from "@tabler/icons-react";
import SectionContainer from "@/modules/ui/section-container";
import {
  CreditPackagesPanel,
  GiveawaysPanel,
  ProductsPanel,
} from "@/modules/dashboard/components/catalog-panels";
import StatCard from "@/modules/dashboard/components/stat-card";
import StreamPanel from "@/modules/dashboard/components/stream-panel";
import {
  RedemptionsPanel,
  SupportPanel,
} from "@/modules/dashboard/components/ticket-panels";
import useDashboardController from "@/modules/dashboard/hooks/use-dashboard-controller";
import { dashboardTabs } from "@/modules/dashboard/lib/constants";

export default function DashboardPage() {
  const dashboard = useDashboardController();

  if (!dashboard.user) {
    return <DashboardMessage title="Dashboard" text="Inicia sesion para administrar la tienda." />;
  }

  if (!dashboard.canManageDashboard) {
    return (
      <DashboardMessage
        eyebrow="Acceso restringido"
        title="Dashboard"
        text="Solo mods, admins y el streamer principal pueden administrar."
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
      <DashboardTabs activeTab={dashboard.activeTab} onChange={dashboard.setActiveTab} />

      {dashboard.error ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
          {dashboard.error}
        </div>
      ) : null}

      <DashboardActivePanel dashboard={dashboard} />
    </SectionContainer>
  );
}

function DashboardMessage({ eyebrow, title, text }) {
  return (
    <SectionContainer className="space-y-6">
      <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-neutral-950/80 p-5 text-center sm:p-8">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase text-red-300/80">{eyebrow}</p>
        ) : null}
        <h1 className={eyebrow ? "mt-2 text-2xl font-bold text-white sm:text-3xl" : "text-2xl font-bold text-white sm:text-3xl"}>
          {title}
        </h1>
        <p className="mt-3 text-neutral-400">{text}</p>
      </div>
    </SectionContainer>
  );
}

function DashboardHeader({ loading, isPending, onRefresh }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase text-red-300/80">
          Administracion
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-neutral-400">
          Gestiona productos, sorteos y tickets desde el mismo panel.
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading || isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-red-400/50 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
      >
        <IconRefresh size={18} />
        Actualizar
      </button>
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
    <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-neutral-950/70 p-2 lg:flex lg:gap-2 lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:p-0">
      {dashboardTabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-semibold transition lg:min-h-0 lg:flex-row lg:gap-2 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:border-b-2 lg:px-4 lg:py-3 lg:text-sm ${
              active
                ? "border-red-400 bg-red-500/15 text-white lg:bg-transparent"
                : "border-white/10 bg-neutral-900/60 text-neutral-500 hover:border-white/20 hover:text-neutral-200 lg:border-transparent lg:bg-transparent"
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
  if (dashboard.activeTab === "products") {
    return (
      <ProductsPanel
        form={dashboard.productForm}
        setForm={dashboard.setProductForm}
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
      />
    );
  }

  if (dashboard.activeTab === "giveaways") {
    return (
      <GiveawaysPanel
        form={dashboard.giveawayForm}
        setForm={dashboard.setGiveawayForm}
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
    return <SupportPanel tickets={dashboard.supportTickets} {...ticketProps} />;
  }

  if (dashboard.activeTab === "redemptions") {
    return <RedemptionsPanel tickets={dashboard.redemptionTickets} {...ticketProps} />;
  }

  if (dashboard.activeTab === "stream") {
    return (
      <StreamPanel
        streamHour={dashboard.streamHour}
        streamRewards={dashboard.streamRewards}
        loading={dashboard.loading}
        isPending={dashboard.isPending}
        onActivateHour={dashboard.activateStreamHour}
        onActivateChest={dashboard.activateStreamChest}
        onActivateChatReward={dashboard.activateStreamChatReward}
        onDisableHour={dashboard.disableStreamHour}
        onUseAutoHour={dashboard.useAutomaticStreamHour}
      />
    );
  }

  return null;
}
