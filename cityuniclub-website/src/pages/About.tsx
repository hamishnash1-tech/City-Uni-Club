import React from 'react'

export const About: React.FC = () => (
  <div className="pb-20">

    {/* Header */}
    <div className="bg-cambridge/15 pt-7 pb-6 px-4 border-b border-cambridge/20 text-center">
      <p className="label-caps text-cambridge-light/50 mb-2">Est. 1895</p>
      <h1 className="font-serif text-2xl font-normal text-ivory">About Our Club</h1>
      <p className="text-ivory/60 text-sm mt-2 max-w-md mx-auto">
        A private members' club in the heart of the City of London.
      </p>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      <section>
        <div className="club-card p-5 text-sm text-ink leading-relaxed space-y-4">
          <p>
            The City University Club (CUC) is a lunch club in the heart of the financial area of London.
            It is the ideal place for lunch or simply a drink at the bar. The Club offers a first class
            meal in discreet circumstances for a modest price.
          </p>
          <p>
            We also offer a comfortable space for business use which can be used from early morning.
          </p>
          <p>
            Originally established in 1895 by Oxbridge graduates who wanted a lunch club in the City,
            the link with the universities remains, although membership is now much wider, embracing both
            sexes and many professions. We have moved to our new premises as of 29th January 2018 to
            42 Crutched Friars London EC3N 2AP. These premises used to be the residence of the Spanish
            Ambassador during the late 18th century.
          </p>
          <p>
            Members joining the Club find the atmosphere equally conducive to lunching with friends or
            on their own at the club tables. The food is first-class; the wine-list comprehensive and
            the service excellent. The Club is open for lunch Monday to Friday throughout the year,
            closing only between Christmas and the New Year. In keeping with other private members clubs
            the dress code is jacket and tie for men and smart dress for ladies (no jeans or trainers).
          </p>
          <p>
            The Club enjoys reciprocity with over 450 of the finest clubs throughout the world including
            many in London and other parts of the country.
          </p>
        </div>
      </section>

    </div>
  </div>
)
