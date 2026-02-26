//
//  SplashView.swift
//  CityUniClub app
//
//  Created by Hamish Nash on 26/02/2026.
//

import SwiftUI

struct SplashView: View {
    @State private var isActive = false
    @State private var showLogo = false
    
    var body: some View {
        ZStack {
            // Oxford Blue Background
            Color.oxfordBlue.ignoresSafeArea()
            
            VStack(spacing: 20) {
                // CUC Logo
                Image("cuc-logo")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 120, height: 120)
                    .opacity(showLogo ? 1 : 0)
                    .scaleEffect(showLogo ? 1 : 0.5)
                
                // Club Name
                Text("CITY UNIVERSITY CLUB")
                    .font(.system(size: 18, weight: .semibold, design: .serif))
                    .foregroundColor(.white)
                    .opacity(showLogo ? 1 : 0)
                    .offset(y: showLogo ? 0 : 20)
                
                // Address
                Text("42 Crutched Friars, London EC3N 2AP")
                    .font(.system(size: 12))
                    .foregroundColor(.cambridgeBlue)
                    .opacity(showLogo ? 1 : 0)
                    .offset(y: showLogo ? 0 : 20)
            }
            
            // Loading Indicator at Bottom
            VStack {
                Spacer()
                
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .cambridgeBlue))
                    .padding(.bottom, 50)
                    .opacity(showLogo ? 1 : 0)
            }
        }
        .onAppear {
            // Animate logo in
            withAnimation(.easeOut(duration: 0.8)) {
                showLogo = true
            }
            
            // Navigate to login after 2.5 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
                withAnimation {
                    isActive = true
                }
            }
        }
        .transition(.opacity)
    }
}

struct SplashView_Previews: PreviewProvider {
    static var previews: some View {
        SplashView()
    }
}
