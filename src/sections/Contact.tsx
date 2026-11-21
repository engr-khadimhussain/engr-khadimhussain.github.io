import { useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Check,
  Copy,
  Download,
  Mail,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Section } from "../components/ui/Section";
import { profile } from "../models/Profile";
import { Clipboard } from "../lib/Clipboard";
import { formatIntlPhone } from "../lib/formatIntlPhone";

interface ContactActionProps {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  icon: LucideIcon;
}

function ContactAction({
  label,
  value,
  href,
  external = false,
  icon: ActionIcon,
}: ContactActionProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy(): Promise<void> {
    const successful = await Clipboard.copy(value, valueRef.current);
    if (!successful) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="group border border-line bg-surface transition-colors duration-300 hover:border-accent">
      <div className="flex items-center gap-4 p-5 md:p-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-line text-accent transition-colors group-hover:border-accent">
          <ActionIcon size={23} strokeWidth={1.6} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {label}
          </p>
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener" : undefined}
            className="break-all font-display text-xl font-semibold text-fg transition-colors hover:text-accent md:text-2xl"
          >
            {label === "Email"
              ? "Send an email"
              : label === "WhatsApp"
                ? "Message on WhatsApp"
                : "Call directly"}
          </a>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <span
              ref={valueRef}
              tabIndex={-1}
              className="min-w-0 select-all break-all text-sm text-muted outline-none"
            >
              {value}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy ${label.toLowerCase()}`}
              className="flex shrink-0 items-center gap-1.5 border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[105px_1fr] gap-3 border-b border-line py-3 last:border-b-0 sm:grid-cols-[125px_1fr]">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <div className="min-w-0 text-sm text-fg">{children}</div>
    </div>
  );
}

export function Contact() {
  const person = profile.person;
  const whatsappDigits = person.whatsapp;
  const formattedWhatsapp = formatIntlPhone(whatsappDigits);
  const phoneHref = `tel:${person.phone.replace(/[^\d+]/g, "")}`;

  return (
    <div className="blueprint-grid relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden opacity-[0.12]"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 720 560"
          fill="none"
          className="h-full min-h-[420px] w-[min(100%,720px)]"
          preserveAspectRatio="xMidYMid meet"
        >
          <g stroke="var(--accent)" strokeWidth="1.4">
            <path d="M30 160H180V260H330" />
            <path d="M330 260H470V180H650" />
            <path d="M470 180V360H650" />
            <path d="M180 260V430H360" />
            <path d="M330 260V80H520" />
            <path d="M520 80V180" />
            <path d="M360 430H560V360" />
            <path d="M165 245L180 260L165 275" />
            <path d="M195 245L180 260L195 275" />
            <path d="M455 165L470 180L455 195" />
            <path d="M485 165L470 180L485 195" />
            <path d="M345 415L360 430L345 445" />
            <path d="M375 415L360 430L375 445" />
            <circle cx="330" cy="260" r="25" />
            <circle cx="520" cy="80" r="22" />
            <path d="M520 58V102M498 80H542" />
            <circle cx="520" cy="80" r="3" fill="var(--accent)" />
            <path d="M520 102V130M505 130H535M512 137H528M518 144H522" />
            <path d="M30 145V175M20 145H40M20 175H40" />
            <path d="M650 165V195M640 165H660M640 195H660" />
          </g>
          <g fill="var(--accent)" fontFamily="monospace" fontSize="12">
            <text x="548" y="76">PI-101</text>
            <text x="350" y="248">XV-01</text>
            <text x="40" y="145">LINE A</text>
            <text x="570" y="350">LINE B</text>
          </g>
          <g stroke="var(--line)" strokeWidth="1" strokeDasharray="5 7">
            <path d="M30 210H120V480H650" />
            <path d="M90 80H260V30H600" />
            <path d="M600 30V500" />
          </g>
        </svg>
      </div>

      <div className="relative z-10">
        <Section
          id="contact"
          eyebrow="AVAILABLE FOR NEW PROJECTS"
          title="Let's Talk"
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="mb-7 max-w-2xl text-base leading-8 text-muted">
                Open to Superintendent / Construction Manager roles in erection,
                shutdowns and turnarounds across the GCC and Pakistan.
              </p>

              <div className="grid gap-4">
                <ContactAction
                  label="Email"
                  value={person.email}
                  href={`mailto:${person.email}`}
                  icon={Mail}
                />
                <ContactAction
                  label="WhatsApp"
                  value={formattedWhatsapp}
                  href={`https://wa.me/${whatsappDigits}`}
                  external
                  icon={Phone}
                />
                <ContactAction
                  label="Phone"
                  value={person.phone}
                  href={phoneHref}
                  icon={Phone}
                />
              </div>
            </div>

            <aside className="border border-line bg-surface/95 p-5 md:p-7">
              <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    Personnel record / 001
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold uppercase text-fg">
                    Quick profile
                  </h3>
                </div>
                <Wrench className="text-muted" size={23} strokeWidth={1.5} />
              </div>

              <div className="font-mono">
                <DataRow label="Location">
                  <span className="inline-flex items-center gap-2 font-sans">
                    <MapPin size={14} className="shrink-0 text-accent" />
                    {person.location}
                  </span>
                </DataRow>
                <DataRow label="Experience">
                  {person.yearsExperience} years
                </DataRow>
                <DataRow label="Countries">
                  <div className="flex flex-wrap gap-2">
                    {person.countries.map((country) => (
                      <span
                        key={country}
                        className="border border-line px-2 py-1 font-sans text-xs text-fg"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </DataRow>
                <DataRow label="Languages">
                  <div className="flex flex-wrap gap-2">
                    {person.languages.map((language) => (
                      <span
                        key={language}
                        className="border border-line px-2 py-1 font-sans text-xs text-fg"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </DataRow>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                  Training & qualifications
                </p>
                <ul className="space-y-2">
                  {profile.training.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-fg"
                    >
                      <Check
                        size={15}
                        className="mt-0.5 shrink-0 text-accent"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="/Khadim-Hussain-CV.pdf"
                download
                className="mt-6 flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-on-accent transition-opacity hover:opacity-85"
              >
                <Download size={16} />
                Download CV (PDF)
              </a>
            </aside>
          </div>
        </Section>
      </div>
    </div>
  );
}
