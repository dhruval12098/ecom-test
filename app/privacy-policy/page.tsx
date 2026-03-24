const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Not updated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not updated';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

async function getDoc() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/docs/privacy-policy`, {
      cache: 'no-store',
    });
    const result = await response.json();
    if (result.success && result.data) {
      return result.data;
    }
  } catch {
    // fall through
  }
  return null;
}

export default async function PrivacyPolicyPage() {
  const doc = await getDoc();
  const content = doc?.content || 'Content will be available soon.';

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {doc?.title || 'Privacy Policy'}
          </h1>
          <p className="text-gray-600">Last updated: {formatDate(doc?.updated_at)}</p>
        </div>

        <div className="bg-white border border-black rounded-2xl p-8">
          <div className="prose max-w-none whitespace-pre-line text-gray-600">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
