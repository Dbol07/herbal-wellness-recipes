interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select';
  options?: string[];
  required?: boolean;
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  options = [],
  required = false,
}: FormInputProps) {
  const baseStyles = `
    w-full px-4 py-3 rounded-lg
    bg-[#1b302c]/80 border border-[#3c6150]/50
    text-[#f2ebd7] placeholder-[#b8d3d5]/50
    focus:outline-none focus:ring-2 focus:ring-[#a77a72]/50 focus:border-[#a77a72]
    transition-all duration-200
  `;

  return (
    <div className="space-y-2">
      <label className="block font-serif text-[#f2ebd7] text-sm">
        {label}
        {required && <span className="text-[#a77a72] ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={baseStyles}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={baseStyles}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={baseStyles}
        />
      )}
    </div>
  );
}
