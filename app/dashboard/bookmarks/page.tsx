import AnalysesTable from '../../../components/dashboard/AnalysesTable';

export default function BookmarksPage() {
  return (
    <AnalysesTable 
      title="Saved Bookmarks" 
      subtitle="Articles you have bookmarked for later reference."
      isBookmarkedOnly={true}
    />
  );
}
