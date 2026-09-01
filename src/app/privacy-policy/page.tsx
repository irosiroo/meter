export const metadata = {
  title: "Privacy Policy — METER",
  description: "Privacy policy for METER Tools Panel.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-fg">Privacy Policy</h1>
      <p className="mt-2 text-sm text-fg-subtle">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-fg-muted">
        <p>
          METER (&quot;we&quot;, &quot;our&quot;, &quot;the site&quot;) provides free online
          calculators and tools. This page explains what information is collected when you use
          this website.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-fg">Information We Collect</h2>
          <p className="mt-2">
            We do not require account creation. Calculation history and favorites are stored
            locally in your browser and are not transmitted to our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Cookies and Advertising</h2>
          <p className="mt-2">
            This site uses Google AdSense to display advertisements. Google and its partners may
            use cookies to serve ads based on your prior visits to this or other websites. You can
            opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" className="underline">
              Google Ads Settings
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Third-Party Vendors</h2>
          <p className="mt-2">
            Third-party vendors, including Google, use cookies to serve ads based on a
            user&apos;s prior visits to this website or other websites. Google&apos;s use of
            advertising cookies enables it and its partners to serve ads based on your visit to
            this site and/or other sites on the Internet.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Contact</h2>
          <p className="mt-2">
            If you have questions about this privacy policy, contact us at{" "}
            <a href="mailto:contact@meter.tools" className="underline">
              contact@meter.tools
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
