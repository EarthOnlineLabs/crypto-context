"use client";

import { DataSources } from "@/components/dashboard";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

export default function SourcesPage() {
  const {
    connections,
    wallets,
    connectExchange,
    disconnectExchange,
    connectWallets,
    disconnectWalletGroup,
  } = useDashboard();

  return (
    <DataSources
      connections={connections}
      wallets={wallets}
      onConnectExchange={connectExchange}
      onDisconnectExchange={disconnectExchange}
      onConnectWallets={connectWallets}
      onDisconnectWalletGroup={disconnectWalletGroup}
    />
  );
}
