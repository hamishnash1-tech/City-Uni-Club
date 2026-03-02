import React from 'react'

interface MenuItem {
  name: string
  description: string
  price?: string
}

interface MenuSection {
  title: string
  icon: string
  items: MenuItem[]
}

export const Menu: React.FC = () => {
  const menuSections: MenuSection[] = [
    {
      title: 'Starters',
      icon: '🥗',
      items: [
        { name: 'Homemade Soup of the Day', description: 'Served with crusty bread' },
        { name: 'Chilli Garlic Pan Fried Tiger Prawns & Chorizo', description: 'With crispy bread' },
        { name: 'Aged Cheddar Cheese & Caramelised Red Onion Tart', description: 'With rocket and tomato salad' },
        { name: 'Devilled Kidneys', description: 'On toast' },
        { name: 'Crispy Ham Hock Croquettes', description: 'With mustard mayo' },
        { name: 'Smoked Salmon Plate', description: 'With brown bread and butter' },
      ]
    },
    {
      title: 'Main Courses',
      icon: '🍖',
      items: [
        { name: 'Roast Rump of Lamb', description: 'With seasonal vegetables and gravy' },
        { name: 'Pan Fried Delice of Salmon', description: 'With samphire and new potatoes' },
        { name: 'Confit Belly of English Pork', description: 'With apple sauce and mash' },
        { name: 'Oven Roasted Free Range Chicken', description: 'With seasonal vegetables' },
        { name: 'Homemade Truffle Mushroom Tortellinis', description: 'With parmesan cream' },
        { name: 'Whole Dover Sole', description: 'With butter and new potatoes' },
      ]
    },
    {
      title: 'Desserts',
      icon: '🍰',
      items: [
        { name: 'Apricot and Pistachio Tart', description: 'With crème fraîche' },
        { name: 'Selection of Cheeses', description: 'With crackers and grapes' },
        { name: 'Ice Creams', description: 'Vanilla, chocolate or strawberry' },
        { name: 'Sticky Toffee Pudding', description: 'With vanilla ice cream' },
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
      <div className="p-4 max-w-3xl mx-auto space-y-8">
        {menuSections.map((section) => (
          <div key={section.title} className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
            {/* Section Header */}
            <div className="bg-oxford-blue text-white px-6 py-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{section.icon}</span>
                <h2 className="text-xl font-serif font-bold">{section.title}</h2>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-6">
              {section.items.map((item, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-serif text-oxford-blue font-semibold">
                      {item.name}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary-text italic">
                    {item.description}
                  </p>
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
