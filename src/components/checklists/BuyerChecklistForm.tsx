'use client';

import React from 'react';
import { BuyerChecklist, ThreeStateChoice } from '@/types';
import { 
  Warehouse, 
  Layers, 
  Truck, 
  Navigation, 
  CheckSquare, 
  FileText
} from 'lucide-react';

interface BuyerChecklistFormProps {
  value?: BuyerChecklist | null;
  onChange?: (value: BuyerChecklist) => void;
  language?: 'pt' | 'en';
  readOnly?: boolean;
}

const DEFAULT_BUYER_CHECKLIST: BuyerChecklist = {
  adequate_storage_space: 'not_informed',
  covered_storage: 'not_informed',
  max_accumulation_volume: undefined,
  max_accumulation_unit: 'kg',
  has_space_height_limitation: 'no',
  space_height_limitation_obs: '',
  available_structures: [],
  can_load_vehicle: 'not_informed',
  has_loading_team: 'not_informed',
  truck_access_ok: 'not_informed',
  maneuver_space_ok: 'not_informed',
  vehicle_restriction: 'no',
  vehicle_restriction_obs: '',
  time_restriction: 'no',
  time_restriction_obs: '',
  requires_prior_scheduling: 'not_informed',
  gate_access_instructions: 'no',
  gate_access_instructions_obs: '',
  can_prepare_material: 'not_informed',
  additional_notes: ''
};

const STRUCTURE_OPTIONS = [
  'Balança',
  'Prensa',
  'Empilhadeira',
  'Paleteira',
  'Doca',
  'Caçamba/contêiner',
  'Nenhum'
];

export function BuyerChecklistForm({
  value,
  onChange,
  language = 'pt',
  readOnly = false
}: BuyerChecklistFormProps) {
  const currentVal = value || DEFAULT_BUYER_CHECKLIST;

  const updateField = <K extends keyof BuyerChecklist>(field: K, val: BuyerChecklist[K]) => {
    if (readOnly || !onChange) return;
    onChange({
      ...currentVal,
      [field]: val
    });
  };

  const handleStructureToggle = (item: string) => {
    if (readOnly || !onChange) return;
    const current = currentVal.available_structures || [];
    let updated: string[];

    if (item === 'Nenhum') {
      if (current.includes('Nenhum')) {
        updated = [];
      } else {
        updated = ['Nenhum'];
      }
    } else {
      const withoutNenhum = current.filter(x => x !== 'Nenhum');
      if (withoutNenhum.includes(item)) {
        updated = withoutNenhum.filter(x => x !== item);
      } else {
        updated = [...withoutNenhum, item];
      }
    }
    updateField('available_structures', updated);
  };

  const renderThreeStateRadio = (
    label: string,
    field: keyof BuyerChecklist,
    currentValChoice?: ThreeStateChoice | null
  ) => {
    const options: { key: ThreeStateChoice; labelPt: string; labelEn: string }[] = [
      { key: 'yes', labelPt: 'Sim', labelEn: 'Yes' },
      { key: 'no', labelPt: 'Não', labelEn: 'No' },
      { key: 'not_informed', labelPt: 'Não informado', labelEn: 'Not informed' }
    ];

    if (readOnly) {
      const selected = options.find(o => o.key === currentValChoice);
      const text = selected 
        ? (language === 'pt' ? selected.labelPt : selected.labelEn) 
        : (language === 'pt' ? 'Não informado' : 'Not informed');
      const badgeColor = currentValChoice === 'yes' ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : currentValChoice === 'no' ? 'bg-rose-100 text-rose-800 border-rose-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

      return (
        <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${badgeColor}`}>
            {text}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-100 dark:border-slate-800/60">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
          {options.map(opt => {
            const isChecked = currentValChoice === opt.key;
            return (
              <label
                key={opt.key}
                className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                  isChecked
                    ? opt.key === 'yes'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : opt.key === 'no'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name={String(field)}
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => updateField(field, opt.key)}
                />
                {language === 'pt' ? opt.labelPt : opt.labelEn}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTwoStateWithObs = (
    label: string,
    boolField: keyof BuyerChecklist,
    obsField: keyof BuyerChecklist,
    placeholder: string,
    currentBool?: 'yes' | 'no' | null,
    currentObs?: string | null
  ) => {
    if (readOnly) {
      return (
        <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
              currentBool === 'yes' 
                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {currentBool === 'yes' ? (language === 'pt' ? 'Sim' : 'Yes') : (language === 'pt' ? 'Não' : 'No')}
            </span>
          </div>
          {currentBool === 'yes' && currentObs && (
            <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
              <strong className="text-slate-700 dark:text-slate-300 font-bold">{language === 'pt' ? 'Detalhes:' : 'Details:'}</strong> {currentObs}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
            <label
              className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                currentBool === 'yes'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <input
                type="radio"
                name={String(boolField)}
                className="sr-only"
                checked={currentBool === 'yes'}
                onChange={() => updateField(boolField, 'yes')}
              />
              {language === 'pt' ? 'Sim' : 'Yes'}
            </label>
            <label
              className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition-all ${
                currentBool === 'no'
                  ? 'bg-slate-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <input
                type="radio"
                name={String(boolField)}
                className="sr-only"
                checked={currentBool === 'no'}
                onChange={() => {
                  updateField(boolField, 'no');
                  updateField(obsField, null);
                }}
              />
              {language === 'pt' ? 'Não' : 'No'}
            </label>
          </div>
        </div>

        {currentBool === 'yes' && (
          <div className="pt-1">
            <input
              type="text"
              value={currentObs || ''}
              onChange={e => updateField(obsField, e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100">
      
      {/* 1. ARMAZENAMENTO */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Warehouse size={16} className="text-[#2098D1]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {language === 'pt' ? '1. Armazenamento' : '1. Storage'}
          </h4>
        </div>

        <div className="space-y-1">
          {renderThreeStateRadio(
            language === 'pt' ? 'Possui espaço adequado para armazenar?' : 'Has adequate storage space?',
            'adequate_storage_space',
            currentVal.adequate_storage_space
          )}

          {renderThreeStateRadio(
            language === 'pt' ? 'Espaço é coberto/protegido?' : 'Is the space covered/sheltered?',
            'covered_storage',
            currentVal.covered_storage
          )}

          {/* Máximo que consegue acumular */}
          <div className="py-2 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {language === 'pt' ? 'Máximo que consegue acumular' : 'Maximum accumulation capacity'}
            </label>
            {readOnly ? (
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {currentVal.max_accumulation_volume 
                  ? `${currentVal.max_accumulation_volume} ${currentVal.max_accumulation_unit || 'kg'}`
                  : (language === 'pt' ? 'Não informado' : 'Not informed')}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentVal.max_accumulation_volume || ''}
                  onChange={e => updateField('max_accumulation_volume', e.target.value)}
                  placeholder="Ex: 2000"
                  className="w-28 px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-[#2098D1]"
                />
                <select
                  value={currentVal.max_accumulation_unit || 'kg'}
                  onChange={e => updateField('max_accumulation_unit', e.target.value as 'kg' | 'ton')}
                  className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none cursor-pointer font-bold"
                >
                  <option value="kg">kg</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            )}
          </div>

          {renderTwoStateWithObs(
            language === 'pt' ? 'Possui limitação de espaço/altura?' : 'Has space or height limitation?',
            'has_space_height_limitation',
            'space_height_limitation_obs',
            language === 'pt' ? 'Descreva a limitação (ex: pé-direito 3m, porta estreita)...' : 'Describe limitation (e.g. 3m ceiling, narrow door)...',
            currentVal.has_space_height_limitation,
            currentVal.space_height_limitation_obs
          )}
        </div>
      </div>

      {/* 2. ESTRUTURA DISPONÍVEL */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#2098D1]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {language === 'pt' ? '2. Estrutura Disponível' : '2. Available Infrastructure'}
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            {language === 'pt' ? 'Marque o que o fornecedor possui' : 'Check all that apply'}
          </span>
        </div>

        {readOnly ? (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {currentVal.available_structures && currentVal.available_structures.length > 0 ? (
              currentVal.available_structures.map(item => (
                <span
                  key={item}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    item === 'Nenhum'
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}
                >
                  ✓ {item}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                {language === 'pt' ? 'Nenhuma estrutura marcada.' : 'No infrastructure checked.'}
              </span>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
            {STRUCTURE_OPTIONS.map(item => {
              const isChecked = (currentVal.available_structures || []).includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleStructureToggle(item)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    isChecked
                      ? item === 'Nenhum'
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-400'
                        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-emerald-400 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                    isChecked
                      ? item === 'Nenhum'
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'bg-emerald-600 text-white border-emerald-600'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                  }`}>
                    {isChecked ? '✓' : ''}
                  </div>
                  <span className="truncate">{item}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. CARREGAMENTO */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Truck size={16} className="text-[#2098D1]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {language === 'pt' ? '3. Carregamento' : '3. Loading'}
          </h4>
        </div>

        <div className="space-y-1">
          {renderThreeStateRadio(
            language === 'pt' ? 'Consegue realizar o carregamento do veículo?' : 'Can perform vehicle loading?',
            'can_load_vehicle',
            currentVal.can_load_vehicle
          )}

          {renderThreeStateRadio(
            language === 'pt' ? 'Possui equipe para auxiliar no carregamento?' : 'Has team to assist with loading?',
            'has_loading_team',
            currentVal.has_loading_team
          )}
        </div>
      </div>

      {/* 4. ACESSO E COLETA */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Navigation size={16} className="text-[#2098D1]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {language === 'pt' ? '4. Acesso e Coleta' : '4. Access and Collection'}
          </h4>
        </div>

        <div className="space-y-1">
          {renderThreeStateRadio(
            language === 'pt' ? 'Caminhão consegue acessar o local?' : 'Can truck access the site?',
            'truck_access_ok',
            currentVal.truck_access_ok
          )}

          {renderThreeStateRadio(
            language === 'pt' ? 'Possui espaço para manobra?' : 'Has space for maneuvering?',
            'maneuver_space_ok',
            currentVal.maneuver_space_ok
          )}

          {renderTwoStateWithObs(
            language === 'pt' ? 'Possui restrição de porte/tipo de veículo?' : 'Has vehicle type/size restriction?',
            'vehicle_restriction',
            'vehicle_restriction_obs',
            language === 'pt' ? 'Ex: Apenas VUC, altura máxima 3.5m, sem carreta...' : 'E.g. VUC only, max height 3.5m, no trailer...',
            currentVal.vehicle_restriction,
            currentVal.vehicle_restriction_obs
          )}

          {renderTwoStateWithObs(
            language === 'pt' ? 'Possui restrição de dia/horário?' : 'Has day/time restrictions?',
            'time_restriction',
            'time_restriction_obs',
            language === 'pt' ? 'Ex: Coletas somente terças e quintas das 08h às 12h...' : 'E.g. Collections only Tue/Thu 8am-12pm...',
            currentVal.time_restriction,
            currentVal.time_restriction_obs
          )}

          {renderThreeStateRadio(
            language === 'pt' ? 'Exige agendamento prévio?' : 'Requires prior scheduling?',
            'requires_prior_scheduling',
            currentVal.requires_prior_scheduling
          )}

          {renderTwoStateWithObs(
            language === 'pt' ? 'Possui orientação especial de acesso/portaria?' : 'Special gate/access instructions?',
            'gate_access_instructions',
            'gate_access_instructions_obs',
            language === 'pt' ? 'Ex: Portaria 2 pela Rua B, apresentar CNH e crachá...' : 'E.g. Gate 2 on Street B, present ID and badge...',
            currentVal.gate_access_instructions,
            currentVal.gate_access_instructions_obs
          )}
        </div>
      </div>

      {/* 5. PREPARAÇÃO & OBSERVAÇÕES */}
      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <CheckSquare size={16} className="text-[#2098D1]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {language === 'pt' ? '5. Preparação do Material' : '5. Material Preparation'}
          </h4>
        </div>

        <div className="space-y-3">
          {renderThreeStateRadio(
            language === 'pt' ? 'Consegue deixar o material preparado para retirada?' : 'Can leave material ready for pickup?',
            'can_prepare_material',
            currentVal.can_prepare_material
          )}

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText size={13} className="text-slate-400" />
              {language === 'pt' ? 'Observações adicionais (opcional)' : 'Additional Notes (optional)'}
            </label>
            {readOnly ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 min-h-[48px] whitespace-pre-wrap">
                {currentVal.additional_notes || (language === 'pt' ? 'Nenhuma observação registrada.' : 'No notes recorded.')}
              </div>
            ) : (
              <textarea
                value={currentVal.additional_notes || ''}
                onChange={e => updateField('additional_notes', e.target.value)}
                placeholder={language === 'pt' ? 'Detalhes adicionais sobre armazenamento, acesso ou particularidades da operação...' : 'Additional details on storage, access or operation nuances...'}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-[#2098D1] min-h-[70px] text-slate-800 dark:text-slate-200"
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
