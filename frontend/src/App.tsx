import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/" element={<p>Homepage</p>} />
          <Route path="*" element={<p>Error page</p>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
