// src/components/forms/ReportForm.tsx
import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import useGeolocation from '@/hooks/useGeolocation';
import { potholeApi } from '@/utils/api';
import type { Pothole, ReportFormValues, ReportedSeverity } from '@/types';

interface Props {
  onSuccess?: (pothole: Pothole, isCluster: boolean) => void;
}

const INITIAL_VALUES: ReportFormValues = {
  reporterName: '',
  reporterContact: '',
  description: '',
  address: '',
  reportedSeverity: 1,
};

const ReportForm = ({ onSuccess }: Props) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<ReportFormValues>(INITIAL_VALUES);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { location, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'reportedSeverity' ? (parseInt(value) as ReportedSeverity) : value,
    }));
  };

  const handleFiles = (selected: File[]) => {
    const capped = selected.slice(0, 5);
    if (capped.some((f) => f.size > 5 * 1024 * 1024)) {
      toast.error(t('errors.file_size'));
      return;
    }
    setFiles(capped);
    setPreviews(capped.map((f) => URL.createObjectURL(f)));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!location) {
      toast.error(`${t('errors.required')} — ${t('report.location_label')}`);
      return;
    }
    if (files.length === 0) {
      toast.error(t('report.images_hint'));
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('latitude', String(location.lat));
      fd.append('longitude', String(location.lng));
      fd.append('reporterName', values.reporterName || 'Anonymous');
      fd.append('reporterContact', values.reporterContact);
      fd.append('description', values.description);
      fd.append('address', values.address);
      fd.append('reportedSeverity', String(values.reportedSeverity));
      files.forEach((f) => fd.append('images', f));

      const res = await potholeApi.create(fd);
      const { data: pothole, meta } = res.data;

      toast.success(t('report.success_title'));
      if (meta.isCluster) toast(t('report.cluster_note'), { icon: '🔥', duration: 5_000 });

      onSuccess?.(pothole, meta.isCluster);

      // Reset
      setValues(INITIAL_VALUES);
      setFiles([]);
      setPreviews([]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        t('errors.generic');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const severityLevels: ReportedSeverity[] = [1, 2, 3];

  return (
    <form className="report-form" onSubmit={handleSubmit} noValidate>
      {/* Reporter Info */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="reporterName">{t('report.name_label')}</label>
          <input
            id="reporterName" name="reporterName" type="text"
            value={values.reporterName} onChange={handleChange}
            placeholder={t('report.name_placeholder')} className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="reporterContact">{t('report.contact_label')}</label>
          <input
            id="reporterContact" name="reporterContact" type="text"
            value={values.reporterContact} onChange={handleChange}
            placeholder={t('report.contact_placeholder')} className="form-input"
          />
        </div>
      </div>

      {/* Description */}
      <div className="form-group">
        <label htmlFor="description">{t('report.description_label')}</label>
        <textarea
          id="description" name="description" rows={3}
          value={values.description} onChange={handleChange}
          placeholder={t('report.description_placeholder')} className="form-textarea"
        />
      </div>

      {/* Severity */}
      <div className="form-group">
        <label>{t('report.severity_label')}</label>
        <div className="severity-options">
          {severityLevels.map((lvl) => (
            <label
              key={lvl}
              className={`severity-option${values.reportedSeverity === lvl ? ' selected' : ''}`}
            >
              <input
                type="radio" name="reportedSeverity"
                value={lvl} checked={values.reportedSeverity === lvl}
                onChange={handleChange}
              />
              <span className="severity-dot" data-level={lvl} />
              <span>{t(`report.severity_${lvl}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="form-group">
        <label htmlFor="address">{t('report.address_label')}</label>
        <input
          id="address" name="address" type="text"
          value={values.address} onChange={handleChange}
          placeholder={t('report.address_placeholder')} className="form-input"
        />
      </div>

      {/* Geolocation */}
      <div className="form-group">
        <label>
          {t('report.location_label')} <span className="required">*</span>
        </label>
        <div className="location-container">
          <button
            type="button" onClick={getLocation} disabled={geoLoading}
            className={`btn-location${location ? ' success' : ''}`}
          >
            {geoLoading
              ? `⏳ ${t('report.location_detecting')}`
              : location
              ? `✅ ${t('report.location_detected')}`
              : `📍 ${t('report.location_detect')}`}
          </button>
          {location && (
            <div className="location-coords">
              <span>📐 {t('report.location_coords')}:</span>
              <code>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</code>
              {location.accuracy !== undefined && (
                <span className="accuracy">±{Math.round(location.accuracy)}m</span>
              )}
            </div>
          )}
          {geoError && (
            <p className="field-error">
              ⚠️{' '}
              {geoError === 'location_denied' ? t('errors.location_denied') : geoError}
            </p>
          )}
        </div>
      </div>

      {/* Image Upload */}
      <div className="form-group">
        <label>
          {t('report.images_label')} <span className="required">*</span>
        </label>
        <div
          className="upload-zone"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef} type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple onChange={handleFileChange} style={{ display: 'none' }}
          />
          <div className="upload-icon">📷</div>
          <p className="upload-text">
            {files.length > 0
              ? t('report.images_selected', { count: files.length })
              : t('report.images_hint')}
          </p>
        </div>

        {previews.length > 0 && (
          <div className="image-previews">
            {previews.map((src, i) => (
              <div key={i} className="preview-item">
                <img src={src} alt={`Preview ${i + 1}`} />
                <button
                  type="button" className="preview-remove"
                  onClick={() => removeFile(i)} aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? `⏳ ${t('report.submitting')}` : `🚧 ${t('report.submit')}`}
      </button>
    </form>
  );
};

export default ReportForm;
