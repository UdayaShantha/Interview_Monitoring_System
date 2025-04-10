import './App.css';
import ThankYou from './thank-you';
import InterviewPage from './interview';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FeedbackSuccess from './ThankYouPage';


// function interview() {
//   return (
//     <div>
//       <h1>Home Page</h1>
//       <Link to="/thank-you">Go to About</Link>
//     </div>
//   );
// }

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<InterviewPage />} />
          { <Route path="/InterviewPage" element={<InterviewPage />} /> }
          <Route path="/ThankYou" element={<ThankYou />} />
        </Routes>
      </div>
    </Router>
    
  );
}

export default App;


