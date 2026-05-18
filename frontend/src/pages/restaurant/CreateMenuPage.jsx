import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById } from "../../redux/actions/restaurantAction";
import { createMenu, getAllMenus } from "../../redux/actions/menuAction";
import { getAllFoodItems } from "../../redux/actions/foodActions";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  ChevronDownIcon,
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
  const { menus, loading: menuLoading } = useSelector((state) => state.menu);

  const [categories, setCategories] = useState([
    { category: "", items: [], isEditing: false },
  ]);
  const [availableFoodItems, setAvailableFoodItems] = useState([]);
  const [existingMenu, setExistingMenu] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      dispatch(getRestaurantById(id));
      dispatch(getAllFoodItems({ restaurantId: id, isAvailable: true }));
      dispatch(getAllMenus({ restaurantId: id }));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (menus && menus.length > 0) {
      const existing = menus.find((menu) => menu.restaurant === id);
      if (existing) {
        setExistingMenu(existing);
        if (existing.menu && existing.menu.length > 0) {
          const existingCategories = existing.menu.map((cat) => ({
            category: cat.category,
            items: cat.items || [],
            isEditing: false,
          }));
          setCategories(existingCategories);
        }
      }
    }
  }, [menus, id]);

  // Set available food items
  useEffect(() => {
    if (foodItems && foodItems.length > 0) {
      setAvailableFoodItems(foodItems);
    }
  }, [foodItems]);

  const addCategory = () => {
    setCategories([
      ...categories,
      { category: "", items: [], isEditing: true },
    ]);
  };

  const removeCategory = (index) => {
    if (categories.length === 1) {
      toast.error("At least one category is required");
      return;
    }
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
  };

  const updateCategoryName = (index, value) => {
    const newCategories = [...categories];
    newCategories[index].category = value;
    setCategories(newCategories);
  };

  const toggleCategoryEdit = (index) => {
    const newCategories = [...categories];
    newCategories[index].isEditing = !newCategories[index].isEditing;
    setCategories(newCategories);
  };

  const addItemToCategory = (categoryIndex, foodItemId) => {
    const foodItem = availableFoodItems.find((item) => item._id === foodItemId);
    if (!foodItem) return;

    const newCategories = [...categories];
    if (!newCategories[categoryIndex].items.includes(foodItemId)) {
      newCategories[categoryIndex].items.push(foodItemId);
      setCategories(newCategories);
      toast.success(
        `Added "${foodItem.name}" to ${newCategories[categoryIndex].category}`,
      );
    } else {
      toast.error("Item already in this category");
    }
  };

  const removeItemFromCategory = (categoryIndex, itemIndex) => {
    const newCategories = [...categories];
    const removedItem = newCategories[categoryIndex].items[itemIndex];
    newCategories[categoryIndex].items.splice(itemIndex, 1);
    setCategories(newCategories);

    const foodItem = availableFoodItems.find(
      (item) => item._id === removedItem,
    );
    if (foodItem) {
      toast.success(`Removed "${foodItem.name}" from category`);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (categories.length === 0) {
      newErrors.categories = "At least one category is required";
    }

    categories.forEach((cat, index) => {
      if (!cat.category.trim()) {
        newErrors[`category_${index}`] = "Category name is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const validCategories = categories
      .filter((cat) => cat.category.trim() !== "")
      .map((cat) => ({
        category: cat.category.trim(),
        items: cat.items,
      }));

    if (validCategories.length === 0) {
      toast.error("Please add at least one valid category");
      setIsSubmitting(false);
      return;
    }

    const menuData = {
      restaurant: id,
      menu: validCategories,
    };

    try {
      let result;
      if (existingMenu) {
        result = await dispatch(
          updateMenu({ menuId: existingMenu._id, menuData }),
        ).unwrap();
        toast.success("Menu updated successfully!");
      } else {
        result = await dispatch(createMenu(menuData)).unwrap();
        toast.success("Menu created successfully!");
      }

      navigate(`/restaurant/${id}`);
    } catch (error) {
      toast.error(error || "Failed to save menu");
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="container mx-auto max-w-5xl px-4">
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
              {existingMenu ? "Edit Menu" : "Create Menu"}
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
                {availableFoodItems.length === 0 ? (
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
                    {availableFoodItems.map((item) => (
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

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Menu Categories
                </h2>
                <button
                  onClick={addCategory}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              {errors.categories && (
                <p className="text-red-500 text-sm mb-4">{errors.categories}</p>
              )}

              <div className="space-y-6">
                {categories.map((category, catIndex) => (
                  <div
                    key={catIndex}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex-1">
                        {category.isEditing ? (
                          <input
                            type="text"
                            value={category.category}
                            onChange={(e) =>
                              updateCategoryName(catIndex, e.target.value)
                            }
                            placeholder="Enter category name (e.g., Appetizers, Main Course, Desserts)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category.category || "Unnamed Category"}
                          </h3>
                        )}
                        {errors[`category_${catIndex}`] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`category_${catIndex}`]}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={() => toggleCategoryEdit(catIndex)}
                          className="p-1 text-gray-500 hover:text-orange-600 transition-colors"
                          title="Edit Category Name"
                        >
                          {category.isEditing ? (
                            <ChevronDownIcon className="w-5 h-5" />
                          ) : (
                            <PlusIcon className="w-5 h-5 rotate-45" />
                          )}
                        </button>
                        <button
                          onClick={() => removeCategory(catIndex)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Remove Category"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            addItemToCategory(catIndex, e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
                        disabled={availableFoodItems.length === 0}
                      >
                        <option value="">+ Add item to this category</option>
                        {availableFoodItems
                          .filter((item) => !category.items.includes(item._id))
                          .map((item) => (
                            <option key={item._id} value={item._id}>
                              {item.name} - ${item.price}
                            </option>
                          ))}
                        {availableFoodItems.filter(
                          (item) => !category.items.includes(item._id),
                        ).length === 0 && (
                          <option disabled>All items added</option>
                        )}
                      </select>
                    </div>

                    {category.items.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Items in this category:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.items.map((itemId, itemIndex) => {
                            const foodItem = availableFoodItems.find(
                              (item) => item._id === itemId,
                            );
                            return (
                              <div
                                key={itemIndex}
                                className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200"
                              >
                                <div className="flex items-center gap-2">
                                  {foodItem?.images && foodItem.images[0] ? (
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
                                    removeItemFromCategory(catIndex, itemIndex)
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
                      <p className="text-sm text-gray-400 italic">
                        No items added to this category yet
                      </p>
                    )}
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">No categories yet</p>
                    <button
                      onClick={addCategory}
                      className="mt-2 text-orange-600 hover:text-orange-700"
                    >
                      Add your first category
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
              <Link
                to={`/restaurant/${id}`}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : existingMenu ? (
                  "Update Menu"
                ) : (
                  "Create Menu"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuPage;
