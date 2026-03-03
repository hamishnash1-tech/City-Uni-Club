import React from 'react'

interface MenuItem {
  name: string
  description: string
  image: string
}

interface MenuSection {
  title: string
  icon: string
  color: string
  items: MenuItem[]
}

export const Menu: React.FC = () => {
  const menuSections: MenuSection[] = [
    {
      title: 'Starters',
      icon: '🥗',
      color: 'bg-green-600',
      items: [
        { 
          name: 'Homemade Soup of the Day', 
          description: 'Served with crusty bread',
          image: '/assets/food/soup.jpg'
        },
        { 
          name: 'Chilli Garlic Pan Fried Tiger Prawns & Chorizo', 
          description: 'With crispy bread',
          image: '/assets/food/prawns.jpg'
        },
        { 
          name: 'Aged Cheddar Cheese & Caramelised Red Onion Tart', 
          description: 'With rocket and tomato salad',
          image: '/assets/food/cocktail.jpg'
        },
        { 
          name: 'Devilled Kidneys', 
          description: 'On toast',
          image: '/assets/food/bbq.jpg'
        },
        { 
          name: 'Crispy Ham Hock Croquettes', 
          description: 'With mustard mayo',
          image: '/assets/food/dessert.jpg'
        },
        { 
          name: 'Smoked Salmon Plate', 
          description: 'With brown bread and butter',
          image: '/assets/food/salmon.jpg'
        },
      ]
    },
    {
      title: 'Main Courses',
      icon: '🍖',
      color: 'bg-red-600',
      items: [
        { 
          name: 'Roast Rump of Lamb', 
          description: 'With seasonal vegetables and gravy',
          image: '/assets/food/bbq.jpg'
        },
        { 
          name: 'Pan Fried Delice of Salmon', 
          description: 'With samphire and new potatoes',
          image: '/assets/food/salmon.jpg'
        },
        { 
          name: 'Confit Belly of English Pork', 
          description: 'With apple sauce and mash',
          image: '/assets/food/bbq.jpg'
        },
        { 
          name: 'Oven Roasted Free Range Chicken', 
          description: 'With seasonal vegetables',
          image: '/assets/food/bbq.jpg'
        },
        { 
          name: 'Homemade Truffle Mushroom Tortellinis', 
          description: 'With parmesan cream',
          image: '/assets/food/pasta.jpg'
        },
        { 
          name: 'Whole Dover Sole', 
          description: 'With butter and new potatoes',
          image: '/assets/food/salmon.jpg'
        },
      ]
    },
    {
      title: 'Desserts',
      icon: '🍰',
      color: 'bg-pink-600',
      items: [
        { 
          name: 'Apricot and Pistachio Tart', 
          description: 'With crème fraîche',
          image: '/assets/food/cake.jpg'
        },
        { 
          name: 'Selection of Cheeses', 
          description: 'With crackers and grapes',
          image: '/assets/food/cheese.jpg'
        },
        { 
          name: 'Ice Creams', 
          description: 'Vanilla, chocolate or strawberry',
          image: '/assets/food/icecream.jpg'
        },
        { 
          name: 'Sticky Toffee Pudding', 
          description: 'With vanilla ice cream',
          image: '/assets/food/cake.jpg'
        },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-oxford-blue sticky top-0 z-10 pt-12 pb-4 px-4">
        <h1 className="text-2xl font-semibold text-white text-center">À La Carte Menu</h1>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto space-y-8">
        {menuSections.map((section) => (
          <div key={section.title} className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
            {/* Section Header */}
            <div className={`${section.color} text-white px-6 py-4`}>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="text-xl font-serif font-bold">{section.title}</h2>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {section.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                  {/* Food Image */}
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Menu+Item'
                      }}
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-serif text-oxford-blue font-semibold mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-secondary-text italic">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Info Card */}
        <div className="bg-cambridge-blue/20 rounded-xl p-6 text-center">
          <p className="text-oxford-blue mb-2">
            <strong>Opening Hours:</strong>
          </p>
          <p className="text-oxford-blue">
            Tuesday - Friday: 8:00 AM - 3:00 PM
          </p>
          <p className="text-oxford-blue mt-2 text-sm">
            For reservations, please call 020 7488 1770 or book online
          </p>
        </div>
      </div>
    </div>
  )
}
