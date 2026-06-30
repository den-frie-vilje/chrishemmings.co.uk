<!--
  Contact + booking block. Reused on the home page and the /get-in-touch
  page. Navy surface so the warm orange CTA reads strongly (AA contrast).
-->
<script lang="ts">
  import { contact, booking } from '$lib/content';

  interface Props {
    /** Show the email/phone details (off when only the CTA is wanted). */
    details?: boolean;
  }
  let { details = true }: Props = $props();
</script>

<section id="contact" class="bg-navy-900 text-paper section-y scroll-mt-20">
  <div class="container-page">
    <div class="mx-auto max-w-2xl text-center">
      <p class="t-eyebrow !text-orange-300">{contact.heading}</p>
      <h2 class="t-h2 mt-3 text-paper">{booking.label}</h2>
      <p class="t-lead mx-auto mt-4 max-w-xl text-cloud">{booking.sub}</p>

      <div class="mt-7 flex flex-wrap justify-center gap-3">
        <a class="btn btn-primary" href={contact.emailHref}>Email Chris</a>
        <a class="btn btn-on-navy" href={contact.phoneHref}>Call or text</a>
      </div>

      {#if details}
        <dl class="mt-8 grid gap-2 text-[0.98rem] text-cloud">
          <div>
            <dt class="sr-only">Email</dt>
            <dd>
              <a class="underline decoration-orange-300/60 underline-offset-2 hover:text-orange-300" href={contact.emailHref}>
                {contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt class="sr-only">Phone</dt>
            <dd>
              <a class="underline decoration-orange-300/60 underline-offset-2 hover:text-orange-300" href={contact.phoneHref}>
                {contact.phone}
              </a>
            </dd>
          </div>
        </dl>
        <p class="mt-4 text-sm text-cloud/80">{contact.location}</p>
      {/if}
    </div>
  </div>
</section>
