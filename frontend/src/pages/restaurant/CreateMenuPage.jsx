import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById } from "../../redux/actions/restaurantAction";
import {
  createMenu,
  getMenuByRestaurant,
  addItemsToMenu,
  removeItemsFromMenu,
  updateCategoryName,
} from "../../redux/actions/menuAction";
import { getAllFoodItems } from "../../redux/actions/foodActions";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const CreateMenuPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedRestaurant: restaurant, loading: restaurantLoading } =
    useSelector((state) => state.restaurants);
  const { foodItems = [], loading: foodLoading } = useSelector(
    (state) => state.food,
  );
  const {
    currentMenu,
    loading: menuLoading,
    categories: menuCategories,
  } = useSelector((state) => state.menu);

  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(getRestaurantById(id));
      dispatch(getAllFoodItems({ restaurantId: id, isAvailable: true }));
      dispatch(getMenuByRestaurant(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentMenu && currentMenu.menu) {
      setCategories(currentMenu.menu);
    } else {
      setCategories([]);
    }
  }, [currentMenu]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!currentMenu) {
      const menuData = {
        restaurant: id,
        menu: [{ category: newCategoryName.trim(), items: [] }],
      };

      setIsSubmitting(true);
      try {
        await dispatch(createMenu(menuData)).unwrap();
        toast.success("Menu created successfully!");
        setNewCategoryName("");
      } catch (error) {
        toast.error(error || "Failed to create menu");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const existingCategories = categories.map((c) => c.category);
      if (existingCategories.includes(newCategoryName.trim())) {
        toast.error("Category already exists");
        return;
      }

      setIsSubmitting(true);
      try {
        const updatedMenu = {
          ...currentMenu,
          menu: [
            ...categories,
            { category: newCategoryName.trim(), items: [] },
          ],
        };

        await dispatch(createMenu(updatedMenu)).unwrap();
        toast.success("Category added successfully!");
        setNewCategoryName("");
      } catch (error) {
        toast.error(error || "Failed to add category");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleUpdateCategoryName = async (oldCategory, newCategory) => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (oldCategory === newCategory.trim()) {
      setEditingCategory(null);
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        updateCategoryName({
          menuId: currentMenu._id,
          oldCategory,
          newCategory: newCategory.trim(),
        }),
      ).unwrap();
      toast.success("Category renamed successfully!");
      setEditingCategory(null);
      setEditingName("");
    } catch (error) {
      toast.error(error || "Failed to rename category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItemToCategory = async (categoryName, foodItemId) => {
    if (!foodItemId) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        addItemsToMenu({
          menuId: currentMenu._id,
          category: categoryName,
          foodItemId,
        }),
      ).unwrap();
      toast.success("Item added to category!");
    } catch (error) {
      toast.error(error || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItemFromCategory = async (
    categoryName,
    foodItemId,
    itemName,
  ) => {
    if (window.confirm(`Remove "${itemName}" from this category?`)) {
      setIsSubmitting(true);
      try {
        await dispatch(
          removeItemsFromMenu({
            menuId: currentMenu._id,
            category: categoryName,
            foodItemId,
          }),
        ).unwrap();
        toast.success("Item removed from category!");
      } catch (error) {
        toast.error(error || "Failed to remove item");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getItemsInCategory = (categoryName) => {
    const category = categories.find((c) => c.category === categoryName);
    if (!category || !category.items) return [];
    return category.items;
  };

  const getFoodItemDetails = (itemId) => {
    return foodItems.find((item) => item._id === itemId);
  };

  if (restaurantLoading || foodLoading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Restaurant not found</p>
          <Link
            to="/restaurants"
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <Link
            to={`/restaurant/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Menu
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">
              {currentMenu ? "Manage Menu" : "Create Menu"}
            </h1>
            <p className="text-orange-100 mt-1">
              {restaurant.name} - Organize your food items into categories
            </p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available Food Items
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {foodItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No food items available</p>
                    <Link
                      to={`/restaurant/${id}/create-food-item`}
                      className="inline-block mt-2 text-orange-600 hover:text-orange-700"
                    >
                      Create Food Item First →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {foodItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images[0].url}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No img
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Add New Category
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Appetizers, Main Course, Desserts"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Category
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No categories yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add your first category using the form above
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((category, catIndex) => {
                  const categoryItems = getItemsInCategory(category.category);
                  const availableItems = foodItems.filter(
                    (item) => !categoryItems.includes(item._id),
                  );

                  return (
                    <div
                      key={catIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        {editingCategory === category.category ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              autoFocus
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleUpdateCategoryName(
                                  category.category,
                                  editingName,
                                )
                              }
                            />
                            <button
                              onClick={() =>
                                handleUpdateCategoryName(
                                  category.category,
                                  editingName,
                                )
                              }
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditingName("");
                              }}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {category.category}
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category.category);
                                  setEditingName(category.category);
                                }}
                                className="p-1 text-gray-500 hover:text-orange-600 transition-colors"
                                title="Edit Category"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="p-4 border-b border-gray-100">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddItemToCategory(
                                category.category,
                                e.target.value,
                              );
                              e.target.value = "";
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
                          disabled={availableItems.length === 0 || !currentMenu}
                        >
                          <option value="">+ Add item to this category</option>
                          {availableItems.map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} - ${item.price}
                            </option>
                          ))}
                          {availableItems.length === 0 && (
                            <option disabled>All items added</option>
                          )}
                        </select>
                      </div>

                      <div className="p-4">
                        {categoryItems.length > 0 ? (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              Items ({categoryItems.length}):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {categoryItems.map((itemId, itemIndex) => {
                                const foodItem = getFoodItemDetails(itemId);
                                return (
                                  <div
                                    key={itemIndex}
                                    className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200"
                                  >
                                    <div className="flex items-center gap-2">
                                      {foodItem?.images &&
                                      foodItem.images[0] ? (
                                        <img
                                          src={foodItem.images[0].url}
                                          alt={foodItem.name}
                                          className="w-8 h-8 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                          <span className="text-gray-400 text-xs">
                                            No img
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {foodItem?.name || "Unknown Item"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          ${foodItem?.price || "0"}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleRemoveItemFromCategory(
                                          category.category,
                                          itemId,
                                          foodItem?.name,
                                        )
                                      }
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Remove from category"
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic text-center py-4">
                            No items added to this category yet
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <Link
                to={`/restaurant/${id}`}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Restaurant
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuPage;
