import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  badge
}) => {
  const navigate = useNavigate();
  const parentCrumb = breadcrumbs?.slice().reverse().find((item) => item.href);

  return (
    <div id="page-header" className="mb-5 pb-4 border-b border-slate-800">
      {(parentCrumb || (breadcrumbs && breadcrumbs.length > 0)) && (
        <div className="flex items-center gap-3 mb-2">
          {parentCrumb && (
            <button
              type="button"
              onClick={() => navigate(parentCrumb.href!)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-400">
              {breadcrumbs.map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  {item.href ? (
                    <Link to={item.href} className="hover:text-slate-200 transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-slate-300 font-medium">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{description}</p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
