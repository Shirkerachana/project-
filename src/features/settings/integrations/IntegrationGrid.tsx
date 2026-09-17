import React from 'react';
import { Integration } from './integration.types';
import { IntegrationCard } from './IntegrationCard';

interface IntegrationGridProps {
  integrations: Integration[];
  onConnect: (integration: Integration) => void;
  onManage: (integration: Integration) => void;
  connectingId?: string | null;
}

export const IntegrationGrid: React.FC<IntegrationGridProps> = ({
  integrations,
  onConnect,
  onManage,
  connectingId
}) => {
  return (
    <div
      id="integrations-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onConnect={onConnect}
          onManage={onManage}
          isConnecting={connectingId === integration.id}
        />
      ))}
    </div>
  );
};
