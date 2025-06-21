import { useState, useCallback } from "react";

export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [isDeleteOpen, setIsDeleteOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);
  const openDeleteModal = useCallback(() => setIsDeleteOpen(true), []);
  const closeDeleteModal = useCallback(() => setIsDeleteOpen(false), []);
  const toggleDeleteModal = useCallback(
    () => setIsDeleteOpen((prev) => !prev),
    []
  );

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    isDeleteOpen,
    openDeleteModal,
    closeDeleteModal,
    toggleDeleteModal,
  };
};
