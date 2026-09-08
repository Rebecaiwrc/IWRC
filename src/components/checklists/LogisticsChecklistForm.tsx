'use client';

import React from 'react';
import { LogisticsChecklist } from '@/types';
import { 
  Truck, 
  Users, 
  Wrench, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  FileText 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const DEFAULT_LOGISTICS_CHECKLIST: LogisticsChecklist = {
  recommended_vehicle: null,
  needs_helper: 'no',
  needs_handling_equipment: 'no',
  needs_storage_provision: 'no',
  storage_provision_details: null,
  needs_adaptation_before_collection: 'no',
  adaptation_details: null,
  estimated_collection_cost: null,
  logistics_notes: null,
};

interface LogisticsChecklistFormProps {
  value?: LogisticsChecklist | null;
  onChange?: (value: LogisticsChecklist) => void;
  language?: 'pt' | 'en';
  readOnly?: boolean;
}

const VEHICLE_OPTIONS = [
  { value: 'VUC (Veículo Urbano de Carga)', labelPt: 'VUC (Veículo Urbano de Carga)', labelEn: 'VUC (Urban Freight Vehicle)' },
  { value: 'Caminhão Toco (2 Eixos)', labelPt: 'Caminhão Toco (2 Eixos)', labelEn: 'Medium Truck (2 Axles)' },
  { value: 'Caminhão Truck (3 Eixos)', labelPt: 'Caminhão Truck (3 Eixos)', labelEn: 'Heavy Truck (3 Axles)' },
  { value: 'Carreta / Cavalo Mecânico', labelPt: 'Carreta / Cavalo Mecânico', labelEn: 'Semi-Trailer Truck' },
  { value: 'Fiorino / Van / Utilitário Leve', labelPt: 'Fiorino / Van / Utilitário Leve', labelEn: 'Van / Light Utility' },
  { value: 'Outro / Específico', labelPt: 'Outro / Específico', labelEn: 'Other / Specific' }
];

export function LogisticsChecklistForm({
  value,
  onChange,
  language = 'pt',
  readOnly = false
}: LogisticsChecklistFormProps) {
  const currentVal = value || DEFAULT_LOGISTICS_CHECKLIST;

  const updateFields = (updates: Partial<LogisticsChecklist>) => {
    if (readOnly || !onChange) return;
    onChange({
      ...currentVal,
      ...updates
    });
  };

  const updateField = <K extends keyof LogisticsChecklist>(field: K, val: LogisticsChecklist[K]) => {
    updateFields({ [field]: val });
  };

  const renderTwoStateRadio = (
    label: string,
    field: keyof LogisticsChecklist,
    currentValChoice?: 'yes' | 'no' | null
  ) => {
    const isYes = currentValChoice === 'yes';
    const isNo = currentValChoice === 'no' || (!currentValChoice && currentValChoice !== undefined);

    if (readOnly) {
      return (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
            isYes 
              ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800' 
              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
          }`}>
            {isYes ? (language === 'pt' ? 'Sim' : 'Yes') : (language === 'pt' ? 'Não' : 'No')}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800/60">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 gap-1">
          <button
            type="button"
            onClick={() => updateField(field, 'yes')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              isYes
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'pt' ? 'Sim' : 'Yes'}
          </button>
          <button
            type="button"
            onClick={() => updateField(field, 'no')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              isNo
                ? 'bg-slate-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            {language === 'pt' ? 'Não' : 'No'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100">
      
      {/* CARD: ANÁLISE OPERACIONAL */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/60 rounded-2xl space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Truck size={16} className="text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-300">
            {language === 'pt' ? 'Análise Operacional da Logística' : 'Logistics Operational Analysis'}
          </h4>
        </div>

        <div className="space-y-1">
          {/* Veículo recomendado */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'pt' ? 'Veículo recomendado' : 'Recommended vehicle'}
            </label>
            {readOnly ? (
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {currentVal.recommended_vehicle || (language === 'pt' ? 'Não definido' : 'Not defined')}
              </span>
            ) : (
              <select
                value={currentVal.recommended_vehicle || ''}
                onChange={e => updateField('recommended_vehicle', e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                <option value="">{language === 'pt' ? 'Selecione o veículo recomendado...' : 'Select recommended vehicle...'}</option>
                {VEHICLE_OPTIONS.map(v => (
                  <option key={v.value} value={v.value}>
                    {language === 'pt' ? v.labelPt : v.labelEn}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Precisa de ajudante? */}
          {renderTwoStateRadio(
            language === 'pt' ? 'Precisa de ajudante?' : 'Requires helper?',
            'needs_helper',
            currentVal.needs_helper
          )}

          {/* Precisa de equipamento para movimentação? */}
          {renderTwoStateRadio(
            language === 'pt' ? 'Precisa de equipamento para movimentação?' : 'Requires material handling equipment?',
            'needs_handling_equipment',
            currentVal.needs_handling_equipment
          )}

          {/* Precisa fornecer Big Bags, pallets ou recipientes? */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Precisa fornecer Big Bags, pallets ou recipientes?' : 'Needs to provide Big Bags, pallets or containers?'}
              </label>
              {readOnly ? (
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  currentVal.needs_storage_provision === 'yes'
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                }`}>
                  {currentVal.needs_storage_provision === 'yes' ? (language === 'pt' ? 'Sim' : 'Yes') : (language === 'pt' ? 'Não' : 'No')}
                </span>
              ) : (
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => updateFields({ needs_storage_provision: 'yes' })}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      currentVal.needs_storage_provision === 'yes'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'pt' ? 'Sim' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFields({ needs_storage_provision: 'no', storage_provision_details: '' })}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      currentVal.needs_storage_provision === 'no' || !currentVal.needs_storage_provision
                        ? 'bg-slate-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'pt' ? 'Não' : 'No'}
                  </button>
                </div>
              )}
            </div>

            {currentVal.needs_storage_provision === 'yes' && (
              readOnly ? (
                currentVal.storage_provision_details && (
                  <p className="text-[11px] text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <strong className="font-bold">{language === 'pt' ? 'Recipientes / Quantidade:' : 'Containers / Quantity:'}</strong> {currentVal.storage_provision_details}
                  </p>
                )
              ) : (
                <input
                  type="text"
                  value={currentVal.storage_provision_details || ''}
                  onChange={e => updateField('storage_provision_details', e.target.value)}
                  placeholder={language === 'pt' ? 'Informe quais recipientes e quantidade (ex: 4 Big Bags 1000kg e 2 Pallets)...' : 'State container type and quantity (e.g. 4 Big Bags and 2 Pallets)...'}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-indigo-300 dark:border-indigo-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                />
              )
            )}
          </div>

          {/* Precisa de alguma adequação antes da coleta? */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'pt' ? 'Precisa de alguma adequação antes da coleta?' : 'Requires adjustments before collection?'}
              </label>
              {readOnly ? (
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  currentVal.needs_adaptation_before_collection === 'yes'
                    ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                }`}>
                  {currentVal.needs_adaptation_before_collection === 'yes' ? (language === 'pt' ? 'Sim' : 'Yes') : (language === 'pt' ? 'Não' : 'No')}
                </span>
              ) : (
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => updateFields({ needs_adaptation_before_collection: 'yes' })}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      currentVal.needs_adaptation_before_collection === 'yes'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'pt' ? 'Sim' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFields({ needs_adaptation_before_collection: 'no', adaptation_details: '' })}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      currentVal.needs_adaptation_before_collection === 'no' || !currentVal.needs_adaptation_before_collection
                        ? 'bg-slate-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    {language === 'pt' ? 'Não' : 'No'}
                  </button>
                </div>
              )}
            </div>

            {currentVal.needs_adaptation_before_collection === 'yes' && (
              readOnly ? (
                currentVal.adaptation_details && (
                  <p className="text-[11px] text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                    <strong className="font-bold">{language === 'pt' ? 'Adequação:' : 'Adjustment:'}</strong> {currentVal.adaptation_details}
                  </p>
                )
              ) : (
                <input
                  type="text"
                  value={currentVal.adaptation_details || ''}
                  onChange={e => updateField('adaptation_details', e.target.value)}
                  placeholder={language === 'pt' ? 'Observação curta sobre a adequação necessária...' : 'Short note on required adjustment...'}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
                />
              )
            )}
          </div>

          {/* Custo estimado da coleta - R$ */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'pt' ? 'Custo estimado da coleta (R$)' : 'Estimated collection cost (R$)'}
            </label>
            {readOnly ? (
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {currentVal.estimated_collection_cost !== null && currentVal.estimated_collection_cost !== undefined && currentVal.estimated_collection_cost !== ''
                  ? formatCurrency(Number(currentVal.estimated_collection_cost))
                  : (language === 'pt' ? 'Não informado' : 'Not informed')}
              </span>
            ) : (
              <div className="relative w-full sm:w-44">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentVal.estimated_collection_cost || ''}
                  onChange={e => updateField('estimated_collection_cost', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            )}
          </div>

          {/* Observações da Logística - opcional */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              {language === 'pt' ? 'Observações da Logística (opcional)' : 'Logistics Notes (optional)'}
            </label>
            {readOnly ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 min-h-[48px] whitespace-pre-wrap">
                {currentVal.logistics_notes || (language === 'pt' ? 'Nenhuma observação registrada.' : 'No notes recorded.')}
              </div>
            ) : (
              <textarea
                value={currentVal.logistics_notes || ''}
                onChange={e => updateField('logistics_notes', e.target.value)}
                placeholder={language === 'pt' ? 'Informações adicionais para a operação de coleta...' : 'Additional notes for collection operation...'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 min-h-[65px] text-slate-800 dark:text-slate-200"
              />
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
