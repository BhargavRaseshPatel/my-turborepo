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
    <main className="organization-create-shell">
      <section className="organization-create-card">
        <p className="organization-create-eyebrow">Workspace setup</p>
        <h1>Create an organization</h1>
        <p className="organization-create-intro">
          Set up a shared workspace for your team, projects, and boards.
        </p>

        <form className="organization-create-form" onSubmit={handleCreateOrganization}>
          <div>
            <label className="dashboard-field-label" htmlFor="organization-name">
              Organization name
            </label>
            <input
              id="organization-name"
              className="dashboard-input"
              type="text"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              placeholder="My Company"
              required
            />
          </div>

          <div>
            <label className="dashboard-field-label" htmlFor="organization-description">
              Description
            </label>
            <textarea
              id="organization-description"
              className="dashboard-textarea"
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              placeholder="What does your organization work on?"
              rows={5}
              required
            />
          </div>

          {errorMessage && <p className="organization-form-error" role="alert">{errorMessage}</p>}

          <button type="submit" className="dashboard-primary-btn organization-submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Organization'}
          </button>
        </form>
      </section>
    </main>
  );
}
