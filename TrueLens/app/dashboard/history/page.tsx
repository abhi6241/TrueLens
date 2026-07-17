import dynamic from 'next/dynamic';

const AnalysesTable = dynamic(() => import('../../../components/dashboard/AnalysesTable'), {
  loading: () => <div className="p-margin-desktop bg-surface max-w-container-max mx-auto w-full flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>,
});

export default function HistoryPage() {
  return (
    <AnalysesTable 
      title="Analysis History" 
      subtitle="Review and manage all your past article analyses."
    />
  );
}
