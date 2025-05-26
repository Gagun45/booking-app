import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";

const SignOutButton = () => {
  const queryClient = useQueryClient();

  const { showToast } = useAppContext();

  const mutation = useMutation(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("validateToken");
      showToast({ message: "Logout successful", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Logout failed", type: "ERROR" });
    },
  });

  const onSignOut = () => {
    mutation.mutate();
  };

  return (
    <button
      onClick={onSignOut}
      className="text-blue-600 cursor-pointer px-3 font-bold bg-white hover:bg-gray-100"
    >
      Sign Out
    </button>
  );
};
export default SignOutButton;
