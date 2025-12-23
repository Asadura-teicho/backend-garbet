/* COMMENTED OUT - Live Casino Page Disabled
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { useTranslation } from '@/hooks/useTranslation'

export default function LiveCasinoPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState(t('liveCasino.all'))

  const games = [
    {
      id: 1,
      name: 'Lightning Roulette',
      provider: 'Evolution',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChfHGClltufVSfk0eEhKSbSiLLP-5jAQvX8Ku9R41Cq8pLmWTbBTdNB7AC7h4rAftaZEbMwlrVFlgssEGta-x3cxZLCNfai6Eo553dxyYk-p0RHJfpD-8RLE2sxMH2vdZGO7aqF3jamgLX9vaaiTVObTuKCDT2sfCippREvffqUbJebz0t9b-GOApCcf0ANV4BuwRdEo_ummuBUcqnEruWSeJ4N9vnZ-itl_m32ia31FA1_8WYUon_RC3muBVc7MEQzRDcGDAfBOs',
      priceRange: '₺10 - ₺50,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbtM-B23HC-elJ4NC0oZ3PIyphGIhPCTXZrVJP9LLQb1k_5_KiwAgmUS-y9zTL7FelzY385sT97wSu3qnY9yOtP0p5ulL_-5Xs4k8VtKH7cxP0Sev65k9JKhGpENOIv5CP1L7-_DikQAoNJrJu8d8dcoMtdQpGBYaaEEssQYVgwdZxlSXSq6sc7e64v23t64rYM9doFtGokp5d9DpCzXyuria9jxy8JZNBSAd8rGonTkk60D2dymFubyyp_B_gpUBbUpgmVKCZGRo'
    },
    {
      id: 2,
      name: 'Crazy Time',
      provider: 'Pragmatic Live',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyfn4H7Nm_BYHaWqWo1BFPB3s2NwAOFAGrKV-Q69GIV0F5pDYi8NzBQoI94iEEBVlXjlupwSGeAsQCsoNYX-2GvkLGbPBQbLUbl_pQZ1Qn4el37MqKG2nyk7_KUkZaNH0vvLb17YEpq_TmL1sLTGrzS0IzE0IiD3OdlGJCq_ads0gfthVPr9nke9_V4lwxs7WnqGpfpjN8twT45J9dgvcQPU1jCGlIkqBb8XfPlwZjWOyZvrYU-_d1be57tIE_Wqb96DlmBlFfEZ0',
      priceRange: '₺5 - ₺25,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVyHMcZark4ntkm6TvEIlRbSNAAfcdBfsRTc-v9tOOzamykyk5FfWZu7pRe7Ke8wCLW-2pOoHsFORj6PXOSQTSklnOEGtJhZh7kucF8LLqsKFcXVC5EZkIgnlSnx9lNp8leT3UVwGfrM_6oBJZDTSJ6XcvaqkvY9E0qAQicI1EhmRggYYDbP-ujjWaRNdpumw8-Z7udHIT_-0WGkj87aFBpj5nrgLV1A_ArirQMNLkV3vUNuoch1_rnDTUxDI88thNN33hUYx7gCk'
    },
    {
      id: 3,
      name: 'Infinite Blackjack',
      provider: 'Evolution',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_y8g4OOU7vwOyB8sOAt9k-BLgR4-3P1xwLTbTdwQIPlffMLIuLiqWx6UYkzlOFyQ4Ty6iKk178432EUT9VO_zUSQHmnot9x8XdHtHnnH95Xe319g3iC2qDCwZ7t6pqu07MhUvz-foH__KmgeAOw__BbBFV8NSMQF-xvGYKYJZ2XiF4fhrTHBJ-duPbVswXlWwPtNQYcz34B9A8C1Dvh5yuUB_odb5hfhdBwJRwnVHNSaXJoa7eVVkMLVMKDWXO8eG2ZJYPbMe_4E',
      priceRange: '₺50 - ₺100,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc4ivafUA0zOXMYjhhSgjqMLPAkXLDAW4CH3vwNzLIPE7TLyzNSIm9BRxkF81Jv7BZgE9YZwLzrbfltwi2D16o8xyEdf4J-RCUnUH7K3zkiSBPnGQUx_FzH68SY3A8qXekKrwc9E3YNyDO5H6vgF_cVZExbNIWgeHktw2_mqWVJ6DoDodl9cPvjLRsVfwceS2THEFlTBaNE13brL04R8Ausqw3os28FdzRw98VPllFDjS8cg1Tg0vBE_YbsRsrn8wv5vIncmANZt8'
    },
    {
      id: 4,
      name: 'Mega Baccarat',
      provider: 'Ezugi',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJoEu4fr53cAg7pOxb-0pJwy_vG6Cuq2n07r4K6N6MUDs9FbRyv5LM1wMsKN0s5MAEkcBmnl-Eirpsal01qOlGtw2yOgfKGNHF0xu0EAc6zY_IyZlx0e6TDMsdcy39l2fJKCTPuwe8cflEZqe-c-w__TPAF1jCIKElAJaJUCbFq2uhe72zDGj_3YMDSziBLdNiVdsLpHOzQO3uwKunRoV4IwspjE3rTU-UDlzAEH8cKDBbq5Uzp3RdLcEHOwhbn9w43Nkf60skITE',
      priceRange: '₺20 - ₺75,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaEiAgU7Z4CFAfnwqYjY2-zShiT1llODCleki2m3ebGohrQV1jIpnomvpicAfEJwNTeP3BLjO3plJYNpdGElgXtdt5pAbmUyWwDURnwJzDIyJWMn_ANlZ_mCNKCpDccjyqr205awUyL1Aiqd5GPVpVjHroo0nrQnMz-cLBVn4aVv70BQhWSBc3LtzXtwqs81fQbsaPJsvo3BpNQN0kZuYGDpMR6o5eRi9KfDyVPhzYkEMsCEpWLfa_xADQPAyFW-8FhN2x5TP-VbE'
    },
    {
      id: 5,
      name: 'Monopoly Live',
      provider: 'Evolution',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDK2vkDRAAZwKQvhk4V0ChoYFeICYujTM7HD-2OLQctzFj-WQgEJveQk9nZhfq0t97MdEe5uoSMesSLH7l7w1TOOoh1OAVTjaAHUbFYK81keZUhBOfZh3a0Om2liNbcMtpOpDP7T91S4ZVY343cWfYKYpB8-wPkdAfKPibj-BcEeL760Xa8bBrXs8Qn0nZvyeESzxqp4c0kghOT4bXOilF0hbPKfI8FhGC5ZUrU_Anw7ehzd7bsNr1ytqyaArAK1dSQntQicMtChng',
      priceRange: '₺5 - ₺25,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSfIwWr7PnWsbQuElYLcTFMaVqjlpM-fpRrGOspISQRswZiLZHurXhmh9uEWcCmgWEjPjhB593S2CchhW27IYOSdaOy5BKBCsy2qI3wuu1mabOeBlZRyPE1AxJr1_bOgOfFEkEMrx_R3ID94VWiyORSzV3LjCQsazHUkQl0c3EEmiA9UgNwgoaJdyVp0iluaxsjnJmtBSIYb4DT3l6cKzZ8L26FGwNVa5RLoptT6c7WUuHJd04snDesXe6unF1xd34StddjIPx-uM'
    },
    {
      id: 6,
      name: 'Speed Blackjack',
      provider: 'Pragmatic Live',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc09EiqIY8EqhiULrSutVPzNnSZyMuZRFD6Srj4ccUy2CJ_K7aTp3oMRb7bxmErP03Wj_cCtdBJ9tzyo1xPDalz5qnFdZKvbGHXomlsGG4hZot9cGTVx4rjimspwYgUipXwZ0iEWIQLz5hOcBHSUhI3lCNyWVRrZtC2y0l5Wh7vRWzFXKiGOsxaR8qPmLdBXLab7pOzdc5DKL06GVg--SiDs-0JnXyAkKWapkpP-xbC08nXORzMbcFRajcpQnuHrouzQTiEKW2FdI',
      priceRange: '₺100 - ₺150,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9rAEdpAkliqU7UHo38gZEiArAF5K1-u4WNOy0nXA0BGJVKFxA0wSKnWzC1hPyElcZ75N-1StJSGC0Sa33KJLAPbkcI7yc_YWg8x9wHtBB-xEA-0_MmRv7dBTHsrG7lSP4ar1sR4HZEJ6VzD2kF7K3aLPdNY2W_rNSroclU3wmsDRQDpOkVijM9Jei2CmZpNrdhEu2bdzvFhajTZTpz65fjISuOvuytCHGUXK1UzSA2WHDiX-BlIPJZ3Jv7NFAZb5R7zs2yT3-D4M'
    },
    {
      id: 7,
      name: 'Dream Catcher',
      provider: 'Evolution',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0C5y7DprYAstZ-7hZ1TyMdxFzFxvbzO2OTcVcaPV1bAhdxiLUHNIxWK9gcWbUJ-ucrsZs9F1imQHDdIQcQn8Ej3c3Od6Mv3OrmJVzhK9OOJz1cXpzVxVmJ2nLzJ6Msy5WRd-Cou44DvL7yA9Owlf3LXNCZGFoISapwC7ITPldbxl-A2FK-StA_h8cDO81Hwmo3IfZDROg-rS981ILzUzV5p-qN9DPxGySGWsfykZhBqr48XVcCMv8jUGav-6EeNvfGMyMSl8I7Yk',
      priceRange: '₺5 - ₺10,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJwi5M1P7iS1WgoYle0xcDXM21Odhjq9ka3g9hqbRp_NXRN4S3rvWqQV07jEfMibcCqYVBSNhnkZYECT06qB4ow8QD-xTc3QzlVa24VADEVi5LNdCxVlB8jc0kaII8nNMsLPn4Cg6MxK_aPUKNbc7CA0V77v2LjrBU82HaAgTeCgNMdGQO5aJ668ZG9Rl3iwhz5qfT2L2OH96jMcebIHRFnXNiRdUt2xPmXsZBoiYtRRUJrr68szt2ykgs-93tBO4cbeD5ypbOzqw'
    },
    {
      id: 8,
      name: 'Dragon Tiger',
      provider: 'Ezugi',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWcmNQbpFVyzqwAtQqMBtNuRhS7BMjSeGdj644edKa-PhTlIuSEeggbQckrpn47AaS6nJXqiq8CAWvXFtaxwRildWwApflXguilizCc711nLvQ_KMsQ6qgDxd-UDVGfrdOj5UsS8houPFr3sw6CJ3F-cLm1Ok2onWuwYsIIixKQvBa_AfuUq0OUswYrMK41aQJBHxCZtSNH3U1XrXa1kDGy34Ro_FF2uOz-z-h1bjJ0mDzXNa5y9osRrRBwYlTj38kD1rcF4VooCI',
      priceRange: '₺20 - ₺50,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiigryK1iJaGhxFArgvVHAQr7w7kRmDriCl38HFVHgo9VY0iUHBKoSj9Ef1vxdJlh7-CUfmQiXhvzji_8GSvu7s8UD1F6JSZnpu5zApdPCdkkO2thDFLm_zmtStEgzP4ZQnLj0BpzmeX3vMTkuFV8hJzIh4M4GtSE-BUFxnQqv1uQ7uBf-v6wdbeWayROJcakRotDRqzFUAQB5YpYBT2hlUc0j3GpP8mf3l4HRpry0VWcFZ8kzysj07XH2ROwR6s1Uc-03nPc6DU4'
    },
    {
      id: 9,
      name: 'Turkish Roulette',
      provider: 'Evolution',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqjgIggS0MorhU16SmSx1vKOqzxHjJVU4Ah0cD-2r5J0l9JGTLWxc79UDa21l2opCIs5k3fRe6LH4Q-ho5iaU-Wx1Gr4oIhV5VqEVP24jSc5PPzvC_tU9c1uYLsdkrfGXxQeAZDh8V22qCSMtXAYVYInEPuDrNi61mH6rWCSgzb1r_GQrDci5P2Y6ebFRzOXOAO9Ryvd7TrLI9f02xmo2KN4NYlP27kUAV2OKqNrWE5sxq87pBI1MLU8oVr07xIi0zXqa0VWgvITo',
      priceRange: '₺10 - ₺50,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3_qyql8itrAgw5p66dgtZEnhKouNRdzzOVQRinq2N84dpBpC1ioAOkPOvgg6JgO7S5CNEaPugomQk0PAPZwDcKwt8I3wKpO35WzCgxwFZr4-OjoxxTVI3bQCwwwdu8nvW3xQH3RQwv7rE5Pq8zOpwJh-6gtb9Bh0bdeLHOX4nPanek-TXDA5AN59HxvXSpScqF5aXksMQzGqPfaBgGxqAbhZpqwPJJwwbIyxWOSK2bALiLPmOf8YqaszIMW9-HH--5VgTUnYKEdQ'
    },
    {
      id: 10,
      name: "Gonzo's Treasure Hunt",
      provider: 'Evolution',
      providerLogo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqlZ5RUWMPFErzmMF6dmjX2sfTn46pZvFuX0Npbdrj0t5D9lWYFcICM6XwJUami2LvC6fwK42JdVoUKk9Z255axOQLaIJiHbpsXkojD4BC-0-jgG1UPGaI1zKsHPhI5SHSF9O3bIubm_TbtnX221pzyN2Tbrz2feKc_QuVUgXGauDcktMpNLev7RtKJOrANShrsYDXGDUN_loMzCSqqI8w1Sf-fGaRx-qzhXcMD_ib8RZgFeLhgEgjEN1nSK2WBJwJyzlRtYht7cs',
      priceRange: '₺2 - ₺10,000',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHzaMpKjI1FNwfPprUtCWFemLEtAV55NAIda9y2oAgEVG7lPZxsqhTTmPYPLps2LC0HAkq9PR_G0FGXeT3YlO1Qawzix_l8ZIbQHBZZyPQbm9Pj30IAvEnrgPrXrvAOhIRP_Sfjv5UjsUXPZfWG8GzoCPpw4ocYvO0BBVNqg9Hg_s5BW3iiPSPAd184nW0h8BGFKnzEIY5tA2xFok0p9g1BbGkiNyrRM4g9GDIjDPQyfE2YqP9kE3S5eSZuKkUOavc9YEEk14iXqw'
    }
  ]

  const providers = [t('liveCasino.all'), 'Evolution', 'Pragmatic Live', 'Ezugi', 'Playtech', 'Vivo Gaming']

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#181611] dark group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <Navbar />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-7xl flex-1">

            <main className="flex-1">
              {/* Hero Section */}
              <div className="px-4 py-8">
                <div 
                  className="flex min-h-[280px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-center p-8 md:p-12 text-left"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(21, 19, 40, 0.85) 0%, rgba(21, 19, 40, 0.3) 100%), url("https://images.unsplash.com/photo-1596838132731-3301c3fd4317?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")`
                  }}
                >
                  <div className="flex flex-col gap-4 max-w-lg">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">{t('liveCasino.title')}</h1>
                    <p className="text-white/80 text-lg font-medium">{t('liveCasino.subtitle')}</p>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          // Scroll to games section or navigate to first game
                          const gamesSection = document.querySelector('[data-games-section]')
                          if (gamesSection) {
                            gamesSection.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                        className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-yellow-400 transition-all"
                      >
                        <span className="truncate">{t('liveCasino.playNow')}</span>
                      </button>
                      <button 
                        onClick={() => router.push('/help/faq')}
                        className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-white/20 transition-all border border-white/20"
                      >
                        <span className="truncate">{t('liveCasino.learnMore')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center gap-3 p-4">
                <p className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">{t('liveCasino.browseGames')}</p>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 px-4 py-3">
                <div className="flex-1">
                  <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                      <div className="text-[#b9b29d] flex bg-[#393528] items-center justify-center pl-4 rounded-l-lg border-r-0">
                        <span className="material-symbols-outlined">search</span>
                      </div>
                      <input 
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-[#393528] focus:border-none h-full placeholder:text-[#b9b29d] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
                        placeholder="Bir oyun ara..." 
                        type="text"
                      />
                    </div>
                  </label>
                </div>
                <div className="w-full md:w-auto">
                  <div className="relative w-full md:w-48">
                    <select className="w-full appearance-none rounded-lg border-none bg-[#393528] h-12 pl-4 pr-10 text-white focus:ring-2 focus:ring-primary/50 text-sm font-medium">
                      <option value="" className="bg-[#393528] text-white">Tüm Sağlayıcılar</option>
                      <option value="evolution" className="bg-[#393528] text-white">Evolution</option>
                      <option value="pragmatic" className="bg-[#393528] text-white">Pragmatic Live</option>
                      <option value="ezugi" className="bg-[#393528] text-white">Ezugi</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#b9b29d]">
                      <span className="material-symbols-outlined">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 overflow-x-auto">
                <div className="flex gap-3 whitespace-nowrap">
                  {providers.map((provider) => (
                    <button
                      key={provider}
                      onClick={() => setSelectedProvider(provider)}
                      className={`flex h-10 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-lg px-4 transition-colors ${
                        selectedProvider === provider
                          ? 'bg-primary'
                          : 'bg-[#393528] hover:bg-[#4a4537]'
                      }`}
                    >
                      <p className={`text-sm font-medium leading-normal ${
                        selectedProvider === provider
                          ? 'text-black font-bold'
                          : 'text-white'
                      }`}>
                        {provider}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                {games.map((game) => (
                  <div key={game.id} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-[#242424] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/50">
                    <div 
                      className="absolute inset-0 bg-cover bg-center" 
                      style={{ backgroundImage: `url("${game.image}")` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5 rounded-full bg-red-600/80 px-2.5 py-1 text-xs font-bold uppercase backdrop-blur-sm">
                          <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                          <span>LIVE</span>
                        </div>
                        <img 
                          className="h-5 w-auto object-contain" 
                          src={game.providerLogo} 
                          alt={`${game.provider} logo`}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold leading-tight">{game.name}</h3>
                        <p className="text-xs font-medium text-gray-300">{game.priceRange}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Link
                        href={`/live-casino?game=${encodeURIComponent(game.name || game.id || '')}`}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-black hover:bg-yellow-400 transition-colors"
                      >
                        <span>{t('liveCasino.playNow')}</span>
                        <span className="material-symbols-outlined text-base">play_arrow</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </main>

            <footer className="mt-12 border-t border-solid border-[#393528] px-4 py-8 text-center text-[#b9b29d]">
              <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-left">
                  <h4 className="font-bold text-white mb-3">Hakkımızda</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link className="hover:text-primary" href="/terms/general">Şartlar &amp; Koşullar</Link></li>
                    <li><Link className="hover:text-primary" href="/about/privacy-policy">Gizlilik Politikası</Link></li>
                    <li><Link className="hover:text-primary" href="/about/responsible-gaming">Sorumlu Oyun</Link></li>
                  </ul>
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-white mb-3">Yardım</h4>
                  <ul className="space-y-2 text-sm">
                    <li><Link className="hover:text-primary" href="/help/live-support">Canlı Destek</Link></li>
                    <li><Link className="hover:text-primary" href="/help/faq">SSS</Link></li>
                    <li><Link className="hover:text-primary" href="/help/contact">Bize Ulaşın</Link></li>
                  </ul>
                </div>
                <div className="col-span-2 text-left md:text-right">
                  <h4 className="font-bold text-white mb-3">Ödeme Yöntemleri</h4>
                  <div className="flex flex-wrap gap-4 justify-start md:justify-end">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-8 w-14 object-contain bg-white rounded px-1" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8 w-14 object-contain bg-white rounded px-1" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png" alt="Bitcoin" className="h-8 w-14 object-contain bg-white rounded px-1" />
                    <img src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png" alt="Bank Transfer" className="h-8 w-14 object-contain bg-white rounded px-1" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="American Express" className="h-8 w-14 object-contain bg-white rounded px-1" />
                    <img src="https://cdn.worldvectorlogo.com/logos/paypal-2.svg" alt="PayPal" className="h-8 w-14 object-contain bg-white rounded px-1" />
                  </div>
                </div>
              </div>
              <p className="mt-8 text-xs text-gray-500">© 2024 Garbet. Tüm hakları saklıdır. Lisanslı ve denetlenen bir oyun platformu.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}
*/

