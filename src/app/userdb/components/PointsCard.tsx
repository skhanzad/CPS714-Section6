import Link from "next/link";

type PointsCardProps = {
  totalPoints: number;
  cardLastDigits: string;
};

export default function PointsCard({ totalPoints, cardLastDigits }: PointsCardProps) {
  const formatted = totalPoints.toLocaleString();

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">My Account &amp; Points</h2>

      <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 flex flex-col justify-between min-h-[170px]">
        <div>
          <p className="text-sm opacity-80">Total Points</p>
          <p className="text-4xl font-bold mt-2">{formatted}</p>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs opacity-90">
          <span>**** {cardLastDigits}</span>
          <span>TMU</span>
        </div>
      </div>
 
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href="/userdb/history"
          className="text-center py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition">
          History
        </Link>

        <Link
          href="/userdb/" className="text-center py-2.5 rounded-xl bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition">
          Redeem
        </Link>
        {/* this link should go to group 6's redeem thing */}
      </div>
    </div>
  );
}
