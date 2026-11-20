export default function FollowUpQuestions({ questions = [] }) {
  if (!questions.length) return <p className="text-sm text-navy-500">No follow-up questions.</p>;
  return (
    <ol className="list-decimal space-y-1.5 pl-5 text-sm text-navy-800">
      {questions.map((q, i) => <li key={i}>{q}</li>)}
    </ol>
  );
}
