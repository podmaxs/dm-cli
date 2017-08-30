
			////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////
			//////       ////   ////   /////////////      ///  /////////////
			//////  ///   ///  / / //  ///////////  /////////  /////////////
			//////  ////  ///  // ///  ////    ///  /////////  /////////////
			//////  ////  ///  //////  ///////////  /////////  /////////////
			//////  ///   ///  //////  ///////////  /////////  /////////////
			//////       ////  //////  ////////////       ///      /////////
			////////////////////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////

				<> Help for dm-cli - dynamicmind client ionic builder <>

	- Init:             $ dm-cli init --env=[enviroment]

							enviroemnt: "variable de  entorno de proyecto"


	- Build app:        $ dm-cli [action] [platform] --env=[enviroment] [--quick=on]
							
							action: run | build | prepare | emulate

							platform: android | ios

							enviroemnt: "variable de  entorno de proyecto"

							--quick=ok (optional): saltea la creacion de resources,
								incremento de version de compilacion, tago en repositorio en git y rescripcion de el config.xml

	- Signed app:       $ dm-cli signed [platform] --env=[enviroment]

							platform: android | ios

							enviroemnt: "variable de  entorno de proyecto"


	- Switch proyect:   $ dm-cli switch [platform] --env=[enviroment]  

							platform: all | android | ios

							enviroemnt: "variable de  entorno de proyecto"
