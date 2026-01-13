import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

export default function CreatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const token = searchParams.get("token");

    try {
      setLoading(true);
      console.log(token)
      const response = await axios.post(
        "http://localhost:3000/auth/accepte",
        {
          password,
        },
        { params: {token} }
      );

      setSuccess("Compte créé avec succès !");
      console.log(response.data);
    } catch (err) {
      setError("Erreur lors de la création du compte.");
      console.log(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100">
      <div className="flex w-[900px] rounded-2xl overflow-hidden shadow-lg">
        {/* Left Side - Form */}
        <div className="w-1/2 bg-white p-10">
          <h1 className="text-2xl font-bold text-gray-900">
            Crée votre mot de passe
          </h1>
          <p className="text-gray-500 mt-2">
            Pour sécuriser votre compte, définissez un mot de passe répondant
            aux critères ci-dessous.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Nouveau mot de passe */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="mt-1 block w-full rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none text-gray-900 placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirmer le mot de passe */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="mt-1 block w-full rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none text-gray-900 placeholder-gray-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error & Success Messages */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-full bg-purple-500 text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50"
            >
              {loading ? "En cours..." : "Continuer"}
            </button>
          </form>
        </div>

        {/* Right Side - Design */}
        <div className="w-1/2 bg-gradient-to-b from-purple-800 to-purple-900 relative flex items-center justify-center">
          <div className="absolute bottom-5 text-white text-sm">© 2025.</div>
        </div>
      </div>
    </div>
  );
}
