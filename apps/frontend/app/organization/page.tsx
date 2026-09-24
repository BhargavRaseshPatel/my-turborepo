'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createOrganization } from '@/lib/api/organizations';

export default function OrganizationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateOrganization = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name || !description) {
      setErrorMessage('Organization name and description are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createOrganization(name, description);

      router.push('/dashboard');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="setup-page">
      <section className="setup-card">
        <p className="page-eyebrow">Workspace setup</p>
        <h1 className="page-heading">Create an organization</h1>
        <p className="page-description">
          Set up a shared workspace for your team, projects, and boards.
        </p>

        <form className="mt-7 grid gap-5" onSubmit={handleCreateOrganization}>
          <div>
            <label className="form-label" htmlFor="organization-name">
              Organization name
            </label>
            <input
              id="organization-name"
              className="form-input"
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="My Company"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="organization-description">
              Description
            </label>
            <textarea
              id="organization-description"
              className="form-input min-h-32 resize-y"
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              placeholder="What does your organization work on?"
              rows={5}
              required
            />
          </div>

          {errorMessage && <p className="-mt-1 text-sm text-red-700" role="alert">{errorMessage}</p>}

          <button type="submit" className="button-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
      </section>
    </main>
  );
}
